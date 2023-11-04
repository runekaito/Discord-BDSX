//BDSXの起動を待つ
const { TextPacket } = require("bdsx/bds/packets");
const launcher_1 = require("bdsx/launcher");
launcher_1.bedrockServer.afterOpen().then(() => {
    //BDSX系のimport
    const packetids_1 = require("bdsx/bds/packetids");
    const event_1 = require("bdsx/event");
    const bdsx_1 = require("bdsx");
    const server_1 = require("bdsx/bds/server");
    const command_1 = require("bdsx/bds/command");
    const command_2 = require("bdsx/command");
    const common_1 = require("bdsx/common");
    const cr = require("bdsx/commandresult");

    //Discord Bot用のimport
    const childProcess = require('child_process');

    //ファイル群読み込み
    const fs = require("fs");
    const path = require("path");
    const filepath = path.resolve(__dirname, './');
    const resolved = path.resolve(__dirname, "./bin/node.exe");
    let blacklist = JSON.parse(fs.readFileSync(`${filepath}/database/blacklist.json`));
    let userinfo = JSON.parse(fs.readFileSync(`${filepath}/database/userinfo.json`));
    /**
     * @type {{token:string,send_channelID:string,discord_command:{bool:boolean,prefix:string},OP_command:{bool:boolean,roleId:string},lang:string,allowBackupLog:boolean,deathLog:boolean}}
     */
    let config = require("./config.jsons")
    const node_dl = require(`${filepath}/modules/node-dl.js`);
    const did = require(`${filepath}/modules/deviceID.js`);
    const mcLang = require("./modules/langParser")

    //Node.exeをダウンロードしBotを起動する
    let myChild;
    let status = false;
    node_dl.download("https://nodejs.org/dist/v18.13.0/win-x64/node.exe", resolved)
        .then(() => {
            status = true;
            process.env.NODE_SKIP_PLATFORM_CHECK = 1;
            myChild = childProcess.fork(`${filepath}/server.js`, { "execPath": resolved });
            //server.jsからのイベント通知受信
            myChild.on('message', (message) => {
                //コマンドを実行する
                if (message[0] === "command") {
                    if (launcher_1.bedrockServer.isClosed()) return;
                    let res = launcher_1.bedrockServer.executeCommand(message[1], cr.CommandResultType.Data);
                    if (!(message[2] === "mute")) {
                        myChild.send(["res", res.data])
                    }
                } else if (message[0] === "list") {
                    //listを送る
                    if (launcher_1.bedrockServer.isClosed()) return;
                    let m = [];
                    for (const player of server_1.serverInstance.getPlayers()) {
                        m.push(player.getNameTag());
                    }
                    myChild.send(["list", m, `${server_1.serverInstance.getPlayers().length}/${server_1.serverInstance.getMaxPlayers()}`]);
                } else if (message[0] === "log") {
                    //標準出力が異なる場合の画面表示
                    console.log(message[1]);
                }
            });
        })

    //lang読み込み
    let country;
    if (config.lang === undefined || !(config.lang in { "ja": null, "en": null })) {
        country = "ja";
    } else {
        country = config.lang;
    }
    let lang = JSON.parse(fs.readFileSync(`${filepath}/lang.json`))[country];
    let languKeys = {}
    switch (country) {
        case "ja": {
            languKeys = mcLang.parser(path.resolve(__dirname, "./mcLangs/ja_jp.lang"))
            break;
        }
        case "en": {
            languKeys = mcLang.parser(path.resolve(__dirname, "./mcLangs/en_us.lang"))
            break;
        }
        default: {
            languKeys = mcLang.parser(path.resolve(__dirname, "./mcLangs/ja_jp.lang"))
            break;
        }
    }
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
    //未処理のエラーのキャッチ
    process.on('unhandledRejection', error => {
        console.log('[Discord-BDSX]:ERROR!\nError Log:\n', error);
    });
    process.on('uncaughtException', error => {
        console.log('[Discord-BDSX]:ERROR!\nError Log:\n', error);
    });
    //チャット受信
    event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
        if (!status) return;
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
    let notDoubleText = {
        lastSendXuid: "000000000",
        content: ""
    }
    event_1.events.packetSend(packetids_1.MinecraftPacketIds.Text).on((ev, ni) => {
        if (!config.deathLog) return;
        if (ev.type == TextPacket.Types.Translate) {
            const message = ev.message
            let key = ""
            if (message in languKeys) {
                key = message
            } else {
                key = message.match(/%.*/)[0].substring(1)
            }
            if (!key.startsWith("death.")) return;
            console.log(ev)
            const player = ni.getActor()
            if (player == null) return;
            const sendMessage = mcLang.formatter(languKeys, key, ev.params.toArray(),true)
            if (player.getXuid() != notDoubleText.lastSendXuid && sendMessage == notDoubleText.content) return;
            notDoubleText.lastSendXuid = player.getXuid()
            notDoubleText.content = sendMessage
            myChild.send(
                [
                    "message",
                    {
                        "embed": {
                            "author": {
                                "name": sendMessage
                            },
                            "description": null,
                            "color": 0x000000
                        }
                    }]);
        }

    });
    //JOINイベント
    event_1.events.playerJoin.on((ev) => {
        if (!status) return;
        const player = ev.player;
        const username = player.getNameTag();
        //変なログインを検知する。
        if (!(username === undefined || username === "undefined")) {
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
            userinfo[username] = { "ip": player.getNetworkIdentifier().getAddress(), "xuid": player.getXuid(), "deviceId": did.parse(player.deviceId), "deviceType": common_1.BuildPlatform[player.getPlatform()] || "Unknown" }
            fs.writeFileSync(`${filepath}/database/userinfo.json`, JSON.stringify(userinfo, null, 4));
        }
    })
    //LEFTイベント
    event_1.events.playerLeft.on((ev) => {
        if (!status) return;
        const id = ev.player.getNameTag();
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
    //server leaveイベント
    event_1.events.serverLeave.on(() => {
        if (myChild === null || myChild === undefined) return;
        process.kill(myChild.pid)
        console.log("[Discord-BDSX] Disconnect")
    })
    //backup イベント
    //kaito02020424/BDSX-Backup想定
    if (config.allowBackupLog) {
        const { backupApi } = require("@bdsx/BDSX-Backup/api");
        backupApi.on("startBackup", () => {
            myChild.send(["message", {
                "embed": {
                    "author": {
                        "name": "Server"
                    },
                    "description": lang.startBackup,
                    "color": 0x0000ff
                }
            }]);
        });
        backupApi.on("finishBackup", () => {
            myChild.send(["message", {
                "embed": {
                    "author": {
                        "name": "Server"
                    },
                    "description": lang.finishBackup,
                    "color": 0x0000ff
                }
            }]);
        })
    }
    //コマンド登録(overloadで複数の引数を指定)
    const dbchat = command_2.command.register("dbchat", "Discord-BDSX configs setting.", command_1.CommandPermissionLevel.Operator);
    dbchat.overload(
        (param, origin, output) => {
            if (param.mode === "reload") {
                reload();
                if (!status) return;
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