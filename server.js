//ファイル群読み込み
const fs = require("fs");
const path = require("path");
const filepath = path.resolve(__dirname, './');
let config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
let country;
if (config.lang === undefined || !(config.lang in { "ja": null, "en": null })) {
    country = "ja";
} else {
    country = config.lang;
}
let lang = JSON.parse(fs.readFileSync(`${filepath}/lang.json`))[country];
let info = { "version": JSON.parse(fs.readFileSync(`${filepath}/lang.json`)).version, "author": JSON.parse(fs.readFileSync(`${filepath}/lang.json`)).author }


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

//Discord Botログイン
const { Client, GatewayIntentBits, EmbedBuilder, underscore } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});
client.on('ready', () => {
    process.send(["log", 'Discord bot Login!']);
    const embed = new EmbedBuilder()
        .setAuthor({ "name": "Server" })
        .setColor(0x00ff00)
        .setDescription(lang.open)
    client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
});
client.on('messageCreate', message => {
    if (message.author.bot) return;//Bot無視
    if (message.channel.id === config.send_channelID) {
        //.evalコマンド
        if (message.content.split(" ")[0] == `${config.discord_command.prefix}eval`) {
            //引数の有無確認
            if (message.content.split(" ").length === 1) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.arg_err)
                message.channel.send({ embeds: [embed] })
                return;
            }
            //権限チェック
            if (!(message.member.roles.cache.has(config.OP_command.roleId) && config.OP_command.bool)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.eval_err)
                message.channel.send({ embeds: [embed] })
                return;
            }
            //スペースまできちんとあるか？
            if (message.content.length > `${config.discord_command.prefix}eval`.length + 1) {
                process.send(["command", message.content.substr(`${config.discord_command.prefix}eval`.length + 1), "data"]);
                process.send(["log", `[Discord-BDSX]${message.author.username} executed: ${message.content.substr(`${config.discord_command.prefix}eval`.length + 1)}`]);
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.arg_err)
                message.channel.send({ embeds: [embed] });
            }
            return;
        } else if (message.content.split(" ")[0] == `${config.discord_command.prefix}userinfo`) {
            //.userinfoコマンド

            //引数の有無確認
            if (message.content.split(" ").length === 1) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_arg_err)
                message.channel.send({ embeds: [embed] })
                return;
            }
            //権限チェック
            if (!(message.member.roles.cache.has(config.OP_command.roleId) && config.OP_command.bool)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_per_err)
                message.channel.send({ embeds: [embed] })
                return;
            }
            //引数チェック
            if (message.content.length <= `${config.discord_command.prefix}userinfo`.length + 1) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_arg_err)
                message.channel.send({ embeds: [embed] });
                return;
            }
            const userinfo = JSON.parse(fs.readFileSync(`${filepath}/database/userinfo.json`));
            if (message.content.substr(`${config.discord_command.prefix}userinfo`.length + 1) in userinfo) {
                const username = message.content.substr(`${config.discord_command.prefix}userinfo`.length + 1);
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "User Info" })
                    .setColor(0x0000ff)
                    .setDescription(`**NameTag**:\n${username}\n**XUID**:\n${userinfo[username]["xuid"]}\n**DeviceID**:\n${userinfo[username]["device"]}`)
                message.channel.send({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.userinfo_not_found)
                message.channel.send({ embeds: [embed] });
            }
            return;
        }
        //.listコマンド
        if (message.content.split(" ")[0] == config.discord_command.prefix + "list") {
            if (!(config.discord_command.bool)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.disabled)
                message.channel.send({ embeds: [embed] });
                return;
            }
            process.send(["list"])
            return;
            //.pingコマンド
        } else if (message.content.split(" ")[0] == config.discord_command.prefix + "ping") {
            if (!(config.discord_command.bool)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.disabled)
                message.channel.send({ embeds: [embed] });
                return;
            }
            const embed = new EmbedBuilder()
                .setAuthor({ "name": "Server" })
                .setColor(0x00ff00)
                .setDescription("**Pong!**")
            message.channel.send({ embeds: [embed] });
            return;
            //.infoコマンド
        } else if (message.content.split(" ")[0] == config.discord_command.prefix + "info") {
            if (!(config.discord_command.bool)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(lang.disabled)
                message.channel.send({ embeds: [embed] });
                return;
            }
            const embed = new EmbedBuilder()
                .setAuthor({ "name": "Plugin Info" })
                .setColor(0x00ff00)
                .setDescription(`${lang.info[0]}${info.author}\n${lang.info[1]}${info.version}`)
            message.channel.send({ embeds: [embed] });
            return;
        }
        //コマンドじゃない場合、チャット送信
        process.send(["command", `tellraw @a {"rawtext":[{"text":"[Discord][${message.author.username.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}§r] ${message.content.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}§r"}]}`, "mute"]);
    }
});
//エラー処理
process.on('unhandledRejection', error => {
    console.log('[Discord-BDSX]:ERROR!\nError Log:\n', error);
});
process.on('uncaughtException', (error) => {
    console.log('[Discord-BDSX]:ERROR!\nError Log:\n', error);
});

//index.jsからのイベント通知受信
process.on('message', (message) => {
    //Discordメッセージ送信
    if (message[0] === "message") {
        const embed = new EmbedBuilder()
            .setAuthor({ "name": message[1].embed.author.name === undefined ? "undefined" : message[1].embed.author.name })
            .setColor(message[1].embed.color)
            .setDescription(message[1].embed.description)
        client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
    } else if (message[0] === "res") {
        //コマンド結果受信
        let res = message[1];
        const embed = new EmbedBuilder()
            .setAuthor({ "name": res.statusCode === 0 ? "Success" : "Error" })
            .setColor(res.statusCode === 0 ? 0x00ff00 : 0xff0000)
            .setDescription(res.statusMessage === null || res.statusMessage === undefined || !typeof res.statusMessage === "string" ? "(null)" : res.statusMessage.length > 4000 ? `${res.statusMessage.substr(0, 4000)}...` : res.statusMessage)
        client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
    } else if (message[0] === "list") {
        //メンバーリスト受信
        const nowlist = message[1];
        let c = "";
        for (const player of nowlist) {
            c += `${player}\n`;
        }
        const embed = new EmbedBuilder()
            .setAuthor({ "name": "Server" })
            .setColor(0x0000ff)
            .setDescription(c.length == 0 ? lang.no_player : c.length > 4000 ? `${c.substr(0, 4000)}...` : c)
            .setFooter({ text: message[2] })
        client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
    } else if (message[0] === "reload") {
        //reloadコマンド
        reload();
    }
});
client.login(config.token);
