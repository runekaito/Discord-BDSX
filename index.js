const packetids_1 = require("bdsx/bds/packetids");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");;
const bdsx_1 = require("bdsx");
const server_1 = require("bdsx/bds/server");
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const nativetype_1 = require("bdsx/nativetype");
const cr = require("bdsx/commandresult");
const childProcess = require('child_process');
const which = require("which")
const resolved = which.sync('node')
const fs = require("fs");
const path = require("path");
const filepath = path.resolve(__dirname, './');
let config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
const myChild = childProcess.fork(`${filepath}/server.js`,{"execPath":resolved});
const connectionList = new Map();
let nowlist = [];


event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
    if (ev.message.length > 4000) {
        myChild.send(["message", {
            "embed": {
                "author": {
                    "name": ev.name
                },
                "description": `${ev.message.substr(0, 4000)}...`,
                "color": 0x0000ff
            }
        }]);
        return;
    }
    myChild.send(["message", {
        "embed": {
            "author": {
                "name": ev.name
            },
            "description": ev.message,
            "color": 0x0000ff
        }
    }]);
});

event_1.events.packetAfter(bdsx_1.MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    const connreq = ptr.connreq;
    const cert = connreq.cert;
    const username = cert.getId();
    if (username) {
        connectionList.set(networkIdentifier, username);
        nowlist.push(username);
    }
    myChild.send(
        [
            "message",
            {
                "embed": {
                    "author": {
                        "name": username
                    },
                    "description": `${username} has joined the server!`,
                    "color": 0x00ff00
                }
            }]);
});
event_1.events.networkDisconnected.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);

    const index = nowlist.indexOf(id);
    nowlist.splice(index, 1);
    myChild.send(["message",{
        "embed": {
            "author": {
                "name": id
            },
            "description": `${id} has left the server!`,
            "color": 0xff0000
        }
    }]);
});

launcher_1.bedrockServer.afterOpen().then(() => {
    command_2.command.register("dbchat", "Discord-BDSX configs setting.", command_1.CommandPermissionLevel.Operator).overload(
        (param, origin, output) => {
            if (param.mode === "reload") {
                config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
                myChild.send(["reload"]);
                output.success("success!");
                return;
            } else {
                output.error("Bad argument.");
            }
        },
        {
            mode: nativetype_1.CxxString
        },
    );
});

myChild.on('message', (message) => {
    if (message[0] === "command"){
        let res = launcher_1.bedrockServer.executeCommand(message[1],cr.CommandResultType.Data);
        if (!(message[2] === "mute")){
            myChild.send(["res",res.data])
        }
    }else if(message[0] === "list"){
        let m = [];
        for (const player of server_1.serverInstance.getPlayers()) {
            m.push(player.getNameTag());
        }
        myChild.send(["list",m]);
    }else if(message[0] === "log"){
        console.log(message[1]);
    }
  });