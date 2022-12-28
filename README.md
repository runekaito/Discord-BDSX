# Discord-BDSX

DiscordとBDSXをつなぐプラグインです。  
git cloneして、フォルダ全体をbdsxルートフォルダ直下のpluginsフォルダに入れてください。  
bdsx/plugins/Discord-BDSX/ファイルごちゃごちゃ  
となるように  
  
config.jsonを編集し、ボットトークンと送受信するチャンネルIDを書き込んでください。  
  
注意:  
チャットボットが導入されているサーバーに、ステージチャンネルやフォーラムチャンネルが存在する場合、エラーが出ます。  
これは、Discord.js v11をBDSXの制約によって使用しているためです。  
