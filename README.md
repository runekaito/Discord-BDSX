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
/dbchat がメインコマンドです。  
  
引数説明  
・reload  
config.jsonの設定を再読み込みします。  

今後設定は追加予定

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
/dbchat is the main command.  
  
Argument Description  
・reload  
Reloads the configuration in config.json.  

More configurations will be added in the future.

> **Warning**  
Kaito02020424, who wrote the README, is Japanese, and the translation is based on DeepL translation, so there may be inaccuracies. Please be aware of this.
