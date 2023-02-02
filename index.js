//BDSXの起動を待つ
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
    let config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
    const node_dl = require(`${filepath}/modules/node-dl.js`);
    const did = require(`${filepath}/modules/deviceID.js`);

    //Node.exeをダウンロードしBotを起動する
    let myChild;
    node_dl.download("https://nodejs.org/dist/v18.13.0/win-x64/node.exe", resolved)
        .then(() => {
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
    //JOINイベント
    event_1.events.playerJoin.on((ev) => {
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
            userinfo[username] = { "ip": player.getNetworkIdentifier().getAddress(), "xuid": player.getXuid(), "deviceId": did.parse(player.deviceId), "deviceType":common_1.BuildPlatform[player.getPlatform()] || "Unknown"}
            fs.writeFileSync(`${filepath}/database/userinfo.json`, JSON.stringify(userinfo, null, 4));
        }
    })
    //LEFTイベント
    event_1.events.playerLeft.on((ev) => {
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
    //コマンド登録(overloadで複数の引数を指定)
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