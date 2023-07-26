# Discord-BDSX APIs
## 日本語  
```js
const dApi = require("@bdsx/Discord-BDSX/api")
```
でAPIをインポートできます。  
### イベント
##### postMessageToMinecraft  
Discordから送られたメッセージを、Minecraftに送信する前に発火されるイベント。  
引数として、  
- payload: ```GatewayMessageCreateDispatchData```
- cancel: ```{cancel: false}```

が渡される。  
使い方:
```js
const dApi = require("@bdsx/Discord-BDSX/api")
dApi.postMessageToMinecraft.on((payload,cancel) => {
  if (payload.content === "cancel") cancel.cancel = true;
});
```
など。  
この例では、cancelというメッセージがDiscordにて送信された場合、Minecraft側への送信をキャンセルしている。  
また、  
使い方2:  
```js
const dApi = require("@bdsx/Discord-BDSX/api")
dApi.postMessageToMinecraft.on((payload,cancel) => {
  if (payload.content === "edit") payload.content = "edit2";
});
```  
とした場合、editというメッセージがDiscordにて送信された場合、Minecraft側へはedit2というメッセージが送られる。  

##### postMessageToDiscord  
Minecraftから送られたメッセージを、Discordに送信する前に発火されるイベント。  
引数として、  
- packet: ```TextPacket```
- payload: ```RESTPostAPIChannelMessageJSONBody```
- sendChannelId: ```{id: string}```
- cancel: ```{cancel: false}```

が渡される。 
> **Note**  
> packet引数は、読み取り専用であり、書き換えはすべてpayloadに行うこと。

使い方:
```js
const dApi = require("@bdsx/Discord-BDSX/api")
dApi.postMessageToDiscord.on((packet,payload,sendChannelId,cancel) => {
  if (packet.message === "cancel") cancel.cancel = true;
});
```  
など。  
この例では、cancelというメッセージがMinecraftにて送信された場合、Discord側への送信をキャンセルしている。  
また、  
使い方2:  
```js
const dApi = require("@bdsx/Discord-BDSX/api")
dApi.postMessageToDiscord.on((packet,payload,sendChannelId,cancel) => {
  if (packet.message === "edit") payload.embed[0].description = "edit2";
});
```  
とした場合、editというメッセージがMinecraftにて送信された場合、Discord側へはedit2というメッセージが送られる。 
##### playerJoin  
Minecraftにプレイヤーが参加した時、メッセージ送信前に発火されるイベント。  
引数として、  
- player: ```Player```
- payload: ```RESTPostAPIChannelMessageJSONBody```
- cancel: ```{cancel: false}```

が渡される。 
> **Note**  
> payload.embeds[0].author.nameに、「～がサーバーにログインしました。」の文字列が格納されているため、書き換える場合はここを書き換えること。
  
上記2つと使い方は同様のため、省略する。
##### playerLeft  
Minecraftからプレイヤーが退出した時、メッセージ送信前に発火されるイベント。  
引数として、  
- player: ```Player```
- payload: ```RESTPostAPIChannelMessageJSONBody```
- cancel: ```{cancel: false}```

が渡される。  
> **Note**  
> `playerJoin`と同様、payload.embeds[0].author.nameに、「～がサーバーからログアウトしました。」の文字列が格納されているため、書き換える場合はここを書き換えること。

例を示した2つと使い方は同様のため、省略する。

##### runDiscordCommand  
Minecraftからプレイヤーが退出した時、メッセージ送信前に発火されるイベント。  
引数として、  
- commandType: ```"eval" | "list" | "userinfo" | "ping" | "info"```
- payload: ```RESTPostAPIChannelMessageJSONBody```
- cancel: ```{cancel: false}```

が渡される。  
例を示した2つと使い方は同様のため、省略する。  

### オブジェクト  
#### dbchatFormatter  
###### username: ```Function``` 
ユーザー名のフォーマットを変更するコールバック関数。
playerJoin,PlayerLeft,postMessageToDiscord,runDiscordCommandのListコマンド実行時に呼び出される。
デフォルトでは,
```js
const defaultFunction = (userName) => userName
```
となっている。
```js
const dApi = require("@bdsx/Discord-BDSX/api")
dApi.dbchatFormatter.username = (userName) => {
  return userName.split(" ")[0] /*文字列のreturnが必須。*/
}
```
のように使う。
- userName: ```string```  
- @return: ```string```  