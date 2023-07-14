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
    const discord = require("@bdsx/discord-module")
    //ファイル群読み込み
    const fs = require("fs");
    const path = require("path");
    const filepath = path.resolve(__dirname, './');
    const resolved = path.resolve(__dirname, "./bin/node.exe");
    let blacklist = JSON.parse(fs.readFileSync(`${filepath}/database/blacklist.json`));
    let userinfo = JSON.parse(fs.readFileSync(`${filepath}/database/userinfo.json`));
    let config = require("./config.json")
    const node_dl = require(`${filepath}/modules/node-dl.js`);
    const did = require(`${filepath}/modules/deviceID.js`);

    const client = new discord.Client(config.token, new discord.Intents().AllIntents)

    //Node.exeをダウンロードしBotを起動する
    let status = false;
    discord.discordEventsList.Ready.on(() => {
        if (status) return
        status = true;
        const embed = new discord.EmbedBuilder()
            .setAuthor({ "name": "Server" })
            .setColor(0x00ff00)
            .setDescription(lang.open)
        client.getChannel(config.send_channelID).sendMessage({
            embeds: [embed]
        })
    })
    discord.discordEventsList.MessageCreate.on((payload) => {
        if (config.send_channelID !== payload.channel_id) return;
        const message = payload.content
        //コマンドを実行する
        if (message.split(" ")[0] === `${config.discord_command.prefix}eval`) {
            if (!client.getMember(client.getChannel(payload.channel_id).info.guild_id, payload.author.id).roles.includes(config.OP_command.roleId) || !config.OP_command.bool) {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.eval_err)
                client.getChannel(payload.channel_id).sendMessage(embed)
                return;
            }
            if (message.split(" ").length < 2) {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.arg_err)
                client.getChannel(payload.channel_id).sendMessage(embed)
                return;
            }
            if (launcher_1.bedrockServer.isClosed()) return;
            let res = launcher_1.bedrockServer.executeCommand(message.split(" ")[1], cr.CommandResultType.Data);
            const embed = new discord.EmbedBuilder()
                .setAuthor({ "name": res.statusCode === 0 ? "Success" : "Error" })
                .setColor(res.statusCode === 0 ? 0x00ff00 : 0xff0000)
                .setDescription(res.statusMessage === null || res.statusMessage === undefined || !typeof res.statusMessage === "string" ? "(null)" : res.statusMessage.length > 4000 ? `${res.statusMessage.substr(0, 4000)}...` : res.statusMessage)
            client.getChannel(payload.id).sendMessage({ embeds: [embed] })
            console.log(`[Discord-BDSX]${message.author.username} executed: ${message.split(" ")[1]}`)
            return
        } else if (message.split(" ")[0] === `${config.discord_command.prefix}list`) {
            //listを送る
            if (launcher_1.bedrockServer.isClosed()) return;
            let m = [];
            for (const player of server_1.serverInstance.getPlayers()) {
                m.push(player.getNameTag());
            }
            let c = "";
            for (const player of m) {
                c += `${player}\n`;
            }
            const embed = new discord.EmbedBuilder()
                .setAuthor({ "name": "Server" })
                .setColor(0x0000ff)
                .setDescription(c.length == 0 ? lang.no_player : c.length > 4000 ? `${c.substr(0, 4000)}...` : c)
                .setFooter({ text: `${server_1.serverInstance.getPlayers().length}/${server_1.serverInstance.getMaxPlayers()}` })
            client.getChannel(payload.id).sendMessage({ embeds: [embed] })
            return
        } else if (message.split(" ")[0] === `${config.discord_command.prefix}userinfo`) {
            if (!client.getMember(client.getChannel(payload.channel_id).info.guild_id, payload.author.id).roles.includes(config.OP_command.roleId) || !config.OP_command.bool) {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_per_err)
                client.getChannel(payload.id).sendMessage({ embeds: [embed] })
                return;
            }
            if (message.split(" ").length < 2) {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_arg_err)
                client.getChannel(payload.id).sendMessage({ embeds: [embed] })
                return;
            }
            const userinfo = require("./database/userinfo.json")
            if (message.split(" ")[1] in userinfo) {
                const username = message.split(" ")[1]
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "User Info" })
                    .setColor(0x0000ff)
                    .setDescription(`**NameTag**:\n${username}\n**XUID**:\n${userinfo[username]["xuid"]}\n**DeviceID**:\n${userinfo[username]["deviceId"]}\n**DeviceType**:\n${userinfo[username]["deviceType"]}`)
                client.getChannel(payload.id).sendMessage({ embeds: [embed] })
            } else {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_not_found)
                client.getChannel(payload.id).sendMessage({ embeds: [embed] })
            }
            return
        } else if (message.split(" ")[0] === `${config.discord_command.prefix}ping`) {
            if (!(config.discord_command.bool)) {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.disabled)
                client.getChannel(payload.id).sendMessage({ embeds: [embed] });
                return;
            }
            const embed = new discord.EmbedBuilder()
                .setAuthor({ "name": "Server" })
                .setColor(0x00ff00)
                .setDescription("**Pong!**")
            client.getChannel(payload.id).sendMessage({ embeds: [embed] });
            return;
        } else if (message.split(" ")[0] === `${config.discord_command.prefix}info`) {
            if (!(config.discord_command.bool)) {
                const embed = new discord.EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.disabled)
                client.getChannel(payload.id).sendMessage({ embeds: [embed] });
                return;
            }
            const embed = new discord.EmbedBuilder()
                .setAuthor({ "name": "Plugin Info" })
                .setColor(0x00ff00)
                .setDescription(`${lang.info[0]}${info.author}\n${lang.info[1]}${info.version}`)
            client.getChannel(payload.id).sendMessage({ embeds: [embed] });
            return;
        } else {
            //コマンドじゃない場合、チャット送信
            launcher_1.bedrockServer.serverInstance.executeCommand(`tellraw @a {"rawtext":[{"text":"[Discord][${message.author.username.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}§r] ${message.content.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}§r"}]}`, cr.CommandResultType.Mute);
        }
    });
    //lang読み込み
    let country;
    if (config.lang === undefined || !(config.lang in { "ja": null, "en": null })) {
        country = "ja";
    } else {
        country = config.lang;
    }
    let lang = (require("./lang.json")[country]);
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
            client.getChannel(config.send_channelID).sendMessage({
                embeds: [
                    {
                        author: {
                            name: ev.name
                        },
                        description: `${ev.message.substr(0, 4000)}...`,
                        color: 0x0000ff
                    }
                ]
            })
            return;
        }
        client.getChannel(config.send_channelID).sendMessage({
            embeds: [
                {
                    author: {
                        name: ev.name
                    },
                    description: ev.message,
                    color: 0x0000ff
                }
            ]
        })
    });
    //JOINイベント
    event_1.events.playerJoin.on((ev) => {
        if (!status) return;
        const player = ev.player;
        const username = player.getNameTag();
        //変なログインを検知する。
        if (!(username === undefined || username === "undefined")) {
            client.getChannel(config.send_channelID).sendMessage({
                embeds: [
                    {
                        author: {
                            name: `${username}${lang.join}`
                        },
                        color: 0x00ff00
                    }
                ]
            })
            userinfo[username] = { "ip": player.getNetworkIdentifier().getAddress(), "xuid": player.getXuid(), "deviceId": did.parse(player.deviceId), "deviceType": common_1.BuildPlatform[player.getPlatform()] || "Unknown" }
            fs.writeFileSync(`${filepath}/database/userinfo.json`, JSON.stringify(userinfo, null, 4));
        }
    })
    //LEFTイベント
    event_1.events.playerLeft.on((ev) => {
        if (!status) return;
        const id = ev.player.getNameTag();
        client.getChannel(config.send_channelID).sendMessage({
            embeds: [
                {
                    author: {
                        name: `${id}${lang.leave}`
                    },
                    color: 0xff0000
                }
            ]
        })
    });
    //server leaveイベント
    event_1.events.serverLeave.on(() => {
        client.disconnect()
        console.log("[Discord-BDSX] Disconnect")
    })
    //backup イベント
    //kaito02020424/BDSX-Backup想定
    if (config.allowBackupLog) {
        const { backupApi } = require("@bdsx/BDSX-Backup/api");
        backupApi.on("startBackup", () => {
            client.getChannel(config.send_channelID).sendMessage({
                embeds: [
                    {
                        author: {
                            name: "Server"
                        },
                        description: lang.startBackup,
                        color: 0x0000ff
                    }
                ]
            })
        });
        backupApi.on("finishBackup", () => {
            client.getChannel(config.send_channelID).sendMessage({
                embeds: [
                    {
                        author: {
                            name: "Server"
                        },
                        description: lang.finishBackup,
                        color: 0x0000ff
                    }
                ]
            })
        })
    }
    //コマンド登録(overloadで複数の引数を指定)
    const dbchat = command_2.command.register("dbchat", "Discord-BDSX configs setting.", command_1.CommandPermissionLevel.Operator);
    dbchat.overload(
        (param, origin, output) => {
            if (param.mode === "reload") {
                reload();
                if (!status) return;
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