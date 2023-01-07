# Discord-BDSX

DiscordとBDSXをつなぐプラグインです。  
git cloneして、フォルダ全体をbdsxルートフォルダ直下のpluginsフォルダに入れてください。  
bdsx/plugins/Discord-BDSX/ファイルごちゃごちゃ  
となるように  
  
config.jsonを編集し、ボットトークンと送受信するチャンネルIDを書き込んでください。  
  
注意:  
BDSX及びこのプラグインを実行するサーバーマシンに、Node.js v16.9.0以上がインストールされているかつ、PATHが通っている(コマンドプロンプトなどでnode -vを実行すると反応する)必要があります。この制限は、内部でDiscord.js v14.7.1を使用しているためです。  
  
#### コマンド  
/dbchat がメインコマンドです。  
  
引数説明  
・reload  
config.jsonの設定を再読み込みします。  

今後設定は追加予定
