const fs = require("fs");
const path = require("path");
const filepath = path.resolve(__dirname, './');
let config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});
var s;
client.on('ready', () => {
    process.send(["log", 'Discord bot Login!']);
    s = true;
});
client.on('messageCreate', message => {
    if (message.author.bot) return;//Bot無視
    if (message.channel.id === config.send_channelID) {
        //.evalコマンド
        if (message.content.substr(0, config.OP_command.prefix.length + 1) === `${config.OP_command.prefix} `) {
            if (!(message.member.roles.cache.has(config.OP_command.roleId) && config.OP_command.bool)) {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription(".evalコマンドを使用する権限がない、もしくは機能が有効になっていません。")
                message.channel.send({ embeds: [embed] })
                return;
            }
            if (message.content.length > config.OP_command.prefix.length + 1) {
                process.send(["command", message.content.substr(config.OP_command.prefix.length + 1), "data"]);
                process.send(["log", `[BDSX-Discord]:${message.author.username} executed ${message.content.substr(config.OP_command.prefix.length + 1)}`]);
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({ "name": "Server" })
                    .setColor(0xff0000)
                    .setDescription("引数エラー:実行するコマンドを指定してください。")
                message.channel.send({ embeds: [embed] });
            }
            return;
        }
        //.listコマンド
        if (config.discord_command.bool && message.content == config.discord_command.prefix + "list") {
            process.send(["list"])
            return;
        }
        //コマンドじゃない場合、チャット送信
        process.send(["command", `tellraw @a {"rawtext":[{"text":"[Discord][${message.author.username}] ${message.content}"}]}`, "mute"]);
    } else {
    }
});

client.on('error', (error) => {
    if (s) {  //error spam prevention
        process.send(["log", "\x1b[31mWebsocket error!\x1b[0m"]);
        s = false;
    }
});
client.on('resume', (num) => {
    if (!s) {
        process.send(["log", "\x1b[32mWebsocket resumed.\x1b[0m"]);
        s = true;
    }
});
process.on('message', (message) => {
    if (message[0] === "message") {
        let embed;
        if (message[1].embed.author.name === undefined) {
            embed = new EmbedBuilder()
                .setAuthor({ "name": "undefined" })
                .setColor(message[1].embed.color)
                .setDescription(message[1].embed.description)
        } else {
            embed = new EmbedBuilder()
                .setAuthor({ "name": message[1].embed.author.name })
                .setColor(message[1].embed.color)
                .setDescription(message[1].embed.description)
        }
        client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
    } else if (message[0] === "res") {
        let res = message[1];
        if (res.statusMessage === null || res.statusMessage === undefined || !typeof res.statusMessage === "string") {
            const embed = new EmbedBuilder()
                .setAuthor({ "name": "Server" })
                .setColor(0x00ff00)
                .setDescription("(null)")
            client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
            return;
        }
        if (res.statusMessage.length > 4000) {
            const embed = new EmbedBuilder()
                .setAuthor({ "name": "Server" })
                .setColor(0x00ff00)
                .setDescription(`${res.statusMessage.substr(0, 4000)}...`)
            client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setAuthor({ "name": "Server" })
            .setColor(0x00ff00)
            .setDescription(res.statusMessage)
        client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
    } else if (message[0] === "list") {
        let nowlist = message[1];
        let c = "";
        for (const player of nowlist) {
            c += `${player}\n`;
        }
        if (c.length == 0) {
            const embed = new EmbedBuilder()
                .setAuthor({ "name": "Server" })
                .setColor(0x0000ff)
                .setDescription("No people")
            client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setAuthor({ "name": "Server" })
            .setColor(0x0000ff)
            .setDescription(c)
        client.channels.cache.get(config.send_channelID).send({ embeds: [embed] });
    } else if (message[0] === "reload") {
        config = JSON.parse(fs.readFileSync(`${filepath}/config.json`));

    }
});
client.login(config.token);
