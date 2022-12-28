const fs = require("fs");
const path = require("path");
const filepath = path.resolve(__dirname, './');
let config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
const discord = require('discord.js');
const packetids_1 = require("bdsx/bds/packetids");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const cr = require("bdsx/commandresult");
const client = new discord.Client();
const bdsx_1 = require("bdsx");
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const nativetype_1 = require("bdsx/nativetype");
const { underline } = require("colors");
const connectionList = new Map();
let nowlist = [];
var s;
client.on('ready', () => {
    console.log('Discord bot Login!');
    s = true;
});
client.on('message', message => {
    if (message.author.bot) return;//Bot無視
    if (message.channel.id === config.send_channelID) {
        //.evalコマンド
        if (message.content.substr(0, config.OP_command.prefix.length + 1) === `${config.OP_command.prefix} `) {
            if (!(message.member.roles.has(config.OP_command.roleId) && config.OP_command.bool)) {
                message.channel.send({
                    "embed": {
                        "author": {
                            "name": "Server"
                        },
                        "description": ".evalコマンドを使用する権限がない、もしくは機能が有効になっていません。",
                        "color": 0xff0000
                    }
                })
                return;
            }
            if (message.content.length > config.OP_command.prefix.length + 1) {
                let res = launcher_1.bedrockServer.executeCommand(message.content.substr(config.OP_command.prefix.length + 1), cr.CommandResultType.Data);
                console.log(`[BDSX-Discord]:${message.author.username} executed ${message.content.substr(config.OP_command.prefix.length + 1)}`);
                if (res.data.statusMessage === null || res.data.statusMessage === undefined || !typeof res.data.statusMessage === "string"){
                    message.channel.send({
                        "embed": {
                            "author": {
                                "name": "Server"
                            },
                            "description": "(null)",
                            "color": 0x00ff00
                        }
                    });
                    return;
                }
                if (res.data.statusMessage.length > 4000) {
                    message.channel.send({
                        "embed": {
                            "author": {
                                "name": "Server"
                            },
                            "description": `${res.data.statusMessage.substr(0, 4000)}...`,
                            "color": 0x00ff00
                        }
                    });
                    return;
                }
                message.channel.send({
                    "embed": {
                        "author": {
                            "name": "Server"
                        },
                        "description": res.data.statusMessage,
                        "color": 0x00ff00
                    }
                });
            } else {
                message.channel.send({
                    "embed": {
                        "author": {
                            "name": "Server"
                        },
                        "description": "引数エラー:実行するコマンドを指定してください。",
                        "color": 0xff0000
                    }
                });
            }
            return;
        }
        //.listコマンド
        if (config.discord_command.bool && message.content == config.discord_command.prefix + "list") {
            let c = "";
            for (const player of nowlist) {
                c += `${player}\n`;
            }
            if (c.length == 0) {
                client.channels.get(config.send_channelID).send({
                    "embed": {
                        "author": {
                            "name": "Server"
                        },
                        "description": "No people",
                        "color": 0x0000ff
                    }
                });
                return;
            }
            client.channels.get(config.send_channelID).send({
                "embed": {
                    "author": {
                        "name": "Server"
                    },
                    "description": c,
                    "color": 0x0000ff
                }
            });
            return;
        }
        //コマンドじゃない場合、チャット送信
        launcher_1.bedrockServer.executeCommand(`tellraw @a {"rawtext":[{"text":"[Discord][${message.author.username}] ${message.content}"}]}`, cr.CommandResultType.Mute);
    }
});
event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
    if (ev.message.length > 4000) {
        client.channels.get(config.send_channelID).send({
            "embed": {
                "author": {
                    "name": ev.name
                },
                "description": `${ev.message.substr(0, 4000)}...`,
                "color": 0x0000ff
            }
        });
        return;
    }
    client.channels.get(config.send_channelID).send({
        "embed": {
            "author": {
                "name": ev.name
            },
            "description": ev.message,
            "color": 0x0000ff
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
    if (!s) {
        console.log("\x1b[32mWebsocket resumed.\x1b[0m");
        s = true;
    }
});
event_1.events.packetAfter(bdsx_1.MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId) => {
    const connreq = ptr.connreq;
    const cert = connreq.cert;
    const username = cert.getId();
    if (username) {
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
                "color": 0x00ff00
            }
        });
});
event_1.events.networkDisconnected.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);

    const index = nowlist.indexOf(id);
    nowlist.splice(index, 1);
    client.channels.get(config.send_channelID).send({
        "embed": {
            "author": {
                "name": id
            },
            "description": `${id} has left the server!`,
            "color": 0xff0000
        }
    });
});

launcher_1.bedrockServer.afterOpen().then(() => {
    command_2.command.register("dbchat", "Discord-BDSX configs setting.", command_1.CommandPermissionLevel.Operator).overload(
        (param, origin, output) => {
            if (param.mode === "reload"){
                try{
                    config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
                }catch(e){
                    output.error("reload error...");
                    return;
                }
                output.success("reload success!");
                return;
            }else{
                output.error("Bad argument.");
            }
        },
        {
            mode:nativetype_1.CxxString
        },
    );
});
client.login(config.token);
