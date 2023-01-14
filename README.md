# Discord-BDSX

### 日本語
DiscordとBDSXをつなぐプラグインです。  
git cloneして、フォルダ全体をbdsxルートフォルダ直下のpluginsフォルダに入れてください。  
bdsx/plugins/Discord-BDSX/ファイルごちゃごちゃ  
となるように  
  
config.jsonを編集し、ボットトークンと送受信するチャンネルID、使用する言語(おそらく"ja")を書き込んでください。  
    
> **Note**  
BDSX及びこのプラグインを実行するサーバーマシンに、Node.js v16.9.0以上がインストールされているかつ、PATHが通っている(コマンドプロンプトなどでnode -vを実行すると反応する)必要があります。この制限は、内部でDiscord.js v14.7.1を使用しているためです。  
  
#### コマンド  
##### マインクラフトにおけるOPコマンド:  
/dbchat がメインコマンドです。  
  
引数説明  
・reload  
config.jsonの設定を再読み込みします。  

##### Discordの指定のチャンネルにおけるコマンド実行:  
- .eval  
先述の、OPロールIDを持っている人は、Discordにおいて、デフォルトでは  
「.eval 実行コマンド」を送信することでコマンドを実行できます。
> **Warning**  
「.eval stop」などもエラーを吐かずに実行でき、非常に危険な権限であるため慎重にロールを指定してください。  

- .list  
一般の権限のない人物でも、デフォルトでは「.list」を実行することで現在サーバーにログインしている人物一覧を取得できます。

---
### English
This is a plugin to connect Discord and BDSX.  
Please git clone and put the whole folder into the plugins folder directly under the bdsx root folder.  
bdsx/plugins/Discord-BDSX/files (e.g. index.js, etc.)
so that  
  
Edit config.json and write the bot token, the channel ID to send/receive, and the language to use (probably "en").  
  
> **Note**   
BDSX and the server machine running this plugin must have Node.js v16.9.0 or higher installed and PATHed (node -v at the command prompt will respond). This limitation is due to the internal use of Discord.js v14.7.1.  
  
#### Commands 
##### OP Commands in Minecraft:
/dbchat is the main command.  
  
Argument Description  
・reload  
Reloads the configuration in config.json.  

##### Execution of a command on a specified channel of Discord: 
- .eval  
The aforementioned, those who have an OP role ID can, by default, in Discord, execute commands by sending  
You can execute the command by sending ".eval execute command".
> **Warning**  
Please specify the role carefully, as ".eval stop" etc. can also be executed without throwing an error, and is a very dangerous privilege.

- .list
Even unauthorized persons can, by default, obtain a list of persons currently logged in to the server by executing ".list".

---
> **Warning**  
Kaito02020424, who wrote the README, is Japanese, and the translation is based on DeepL translation, so there may be inaccuracies. Please be aware of this.
