const launcher_1 = require("bdsx/launcher");
launcher_1.bedrockServer.afterOpen().then(() => {
    const packetids_1 = require("bdsx/bds/packetids");
    const event_1 = require("bdsx/event");
    const bdsx_1 = require("bdsx");
    const server_1 = require("bdsx/bds/server");
    const command_1 = require("bdsx/bds/command");
    const command_2 = require("bdsx/command");
    const common_1 = require("bdsx/common");
    const cr = require("bdsx/commandresult");
    const childProcess = require('child_process');
    const fs = require("fs");
    const path = require("path");
    const filepath = path.resolve(__dirname, './');
    const resolved = path.resolve(__dirname, "./bin/node.exe");
    let blacklist = JSON.parse(fs.readFileSync(`${filepath}/database/blacklist.json`));
    let userinfo = JSON.parse(fs.readFileSync(`${filepath}/database/userinfo.json`));
    let config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
    const node_dl = require(`${filepath}/modules/node-dl.js`);
    let myChild;
    node_dl.download("https://nodejs.org/dist/v18.13.0/win-x64/node.exe", resolved)
        .then(() => {
            process.env.NODE_SKIP_PLATFORM_CHECK = 1;
            myChild = childProcess.fork(`${filepath}/server.js`, { "execPath": resolved });
            myChild.on('message', (message) => {
                if (message[0] === "command") {
                    let res = launcher_1.bedrockServer.executeCommand(message[1], cr.CommandResultType.Data);
                    if (!(message[2] === "mute")) {
                        myChild.send(["res", res.data])
                    }
                } else if (message[0] === "list") {
                    let m = [];
                    for (const player of server_1.serverInstance.getPlayers()) {
                        m.push(player.getNameTag());
                    }
                    myChild.send(["list", m, `${server_1.serverInstance.getPlayers.length}/${server_1.serverInstance.getMaxPlayers()}`]);
                } else if (message[0] === "log") {
                    console.log(message[1]);
                }
            });
        })
    const connectionList = new Map();
    let nowlist = [];
    let country;
    if (config.lang === undefined || !(config.lang in { "ja": null, "en": null })) {
        country = "ja";
    } else {
        country = config.lang;
    }
    let lang = JSON.parse(fs.readFileSync(`${filepath}/lang.json`))[country];
    //reload function
    function reload() {
        config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
        if (config.lang === undefined || !(config.lang in { "ja": null, "en": null })) {
            country = "ja";
        } else {
            country = config.lang;
        }
        lang = JSON.parse(fs.readFileSync(`${filepath}/lang.json`))[country];
    }
    process.on('unhandledRejection', error => {
        console.log('[Discord-BDSX]:ERROR!\nError Log:\n', error);
    });
    process.on('uncaughtException', (err) => {
        console.log('[Discord-BDSX]:ERROR!\nError Log:\n', err);
    });
    event_1.events.packetAfter(bdsx_1.MinecraftPacketIds.SubClientLogin)
    event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
        if (ev.name in blacklist) {
            return;
        }
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
    event_1.events.playerJoin.on((ev) => {
        const player = ev.player;
        const username = player.getNameTag();
        if (!(username === undefined || username === "undefined")) {
            userinfo[username] = { "ip": player.getNetworkIdentifier().getAddress(), "xuid": player.getXuid(), "device": player.deviceId }
            fs.writeFileSync(`${filepath}/database/userinfo.json`, JSON.stringify(userinfo, null, 4));
        }
    })
    event_1.events.packetAfter(bdsx_1.MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
        const connreq = ptr.connreq;
        const cert = connreq.getCertificate();
        if (connreq === null)
            return; // wrong client
        if (cert === null)
            return; // wrong client ?
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
                            "name": `${username}${lang.join}`
                        },
                        "description": null,
                        "color": 0x00ff00
                    }
                }]);
    });
    event_1.events.networkDisconnected.on(networkIdentifier => {
        const id = connectionList.get(networkIdentifier);
        connectionList.delete(networkIdentifier);

        const index = nowlist.indexOf(id);
        nowlist.splice(index, 1);
        myChild.send(["message", {
            "embed": {
                "author": {
                    "name": `${id}${lang.leave}`
                },
                "description": null,
                "color": 0xff0000
            }
        }]);
    });
    const dbchat = command_2.command.register("dbchat", "Discord-BDSX configs setting.", command_1.CommandPermissionLevel.Operator);
    dbchat.overload(
        (param, origin, output) => {
            if (param.mode === "reload") {
                reload();
                myChild.send(["reload"]);
                output.success("success!");
                return;
            } else {
                output.error("Bad argument.");
            }
        },
        {
            mode: command_2.command.enum("reload", { reload: "reload" })
        },
    );
    dbchat.overload(
        (param, origin, output) => {
            if (param.mode === "blacklist") {
                for (const player of server_1.serverInstance.getPlayers()) {
                    if (player.getNameTag() === param.username.getName()) {
                        if (player.getNameTag() in blacklist) {
                            output.error("It has already been registered.");
                        } else {
                            blacklist[player.getNameTag()] = true;
                            fs.writeFileSync(`${filepath}/database/blacklist.json`, JSON.stringify(blacklist, null, 4));
                            output.success("success!");
                        }
                        return;
                    }
                }
                output.error("User not found.");
            } else {
                output.error("Bad argument.");
            }
        }, {
        mode: command_2.command.enum("blacklist", { blacklist: "blacklist" }),
        motion: command_2.command.enum("add-list", { add: "add" }),
        username: command_1.ActorCommandSelector
    }
    );
    dbchat.overload(
        (param, origin, output) => {
            if (param.mode === "blacklist") {
                if (param.username.getName() in blacklist) {
                    delete blacklist[param.username.getName()];
                    fs.writeFileSync(`${filepath}/database/blacklist.json`, JSON.stringify(blacklist, null, 4));
                    output.success("success!");
                } else {
                    output.error("User is not blacklisted.");
                }
                return;
            } else {
                output.error("Bad argument.");
            }
        }, {
        mode: command_2.command.enum("blacklist", { blacklist: "blacklist" }),
        motion: command_2.command.enum("remove", { remove: "remove" }),
        username: command_1.ActorCommandSelector
    }
    );
    dbchat.overload(
        (param, origin, output) => {
            if (param.mode === "blacklist") {
                let m = "Blacklisted users:\n";
                let c = 0;
                for (const t in blacklist) {
                    c++;
                    m += `${c}. ${t}\n`;
                }
                output.success(m);
            } else {
                output.error("Bad argument.");
            }
        }, {
        mode: command_2.command.enum("blacklist", { blacklist: "blacklist" }),
        motion: command_2.command.enum("list", { list: "list" })
    });
});