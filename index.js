const fs = require("fs");
const path = require("path");
const filepath = path.resolve(__dirname, './');
const config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
const discord = require('discord.js');
const packetids_1 = require("bdsx/bds/packetids");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const CommandResultType = require("bdsx/commandresult");
const client = new discord.Client();
const bdsx_1 = require("bdsx");
const connectionList = new Map();
let nowlist=[];
var s;
client.on('ready', () => {
    console.log('Discord bot Login!');
    s = true;
});
client.on('message', message => {
    if (message.author.bot) return;

    if (message.channel.id === config.send_channelID) {
        if (config.discord_command.bool && message.content==config.discord_command.prefix+"list"){
            let c="";
            for (const player of nowlist) {
                c+=`${player}\n`;
            }
            if(c.length==0){
                client.channels.get(config.send_channelID).send({
                    "embed": {
                        "author": {
                            "name":"Server"
                        },
                        "description": "No people",
                        "color":0x0000ff
                    }
                });
                return;
            }
            client.channels.get(config.send_channelID).send({
                "embed": {
                    "author": {
                        "name":"Server"
                    },
                    "description": c,
                    "color":0x0000ff
                }
            });
            return;
        }
        launcher_1.bedrockServer.executeCommand(`tellraw @a {"rawtext":[{"text":"[Discord][${message.author.username}] ${message.content}"}]}`, CommandResultType.Mute);
    }
});
event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
    client.channels.get(config.send_channelID).send({
        "embed": {
            "author": {
                "name":ev.name
            },
            "description": ev.message,
            "color":0x0000ff
        }
    });
});
client.on('error', (error) => {
    if (s) {  //error spam prevention
        console.log("\x1b[31mWebsocket error!\x1b[0m");
        s = false;
    }
});
client.on('resume', (num) => {
    if (!s){
        console.log("\x1b[32mWebsocket restart!\x1b[0m");
        s = true;
    }
});
event_1.events.packetAfter(bdsx_1.MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    const connreq = ptr.connreq;
    const cert = connreq.cert;
    const username = cert.getId();
    if (username){
        connectionList.set(networkIdentifier, username);
        nowlist.push(username);
    }
    client.channels.get(config.send_channelID).send(
        {
            "embed": {
                "author": {
                    "name": username
                },
                "description": `${username} has joined the server!`,
                "color":0x00ff00
            }
        });
});
event_1.events.networkDisconnected.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);

    const index = nowlist.indexOf(id);
    nowlist.splice(index,1);
    client.channels.get(config.send_channelID).send({
        "embed": {
            "author": {
                "name": id
            },
            "description": `${id} has left the server!`,
            "color":0xff0000
        }
    });
});
client.login(config.token);
