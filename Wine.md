### 日本語
> ### Wine環境(Linux)での使い方

前提条件:
- BDSXが動作するWineの環境が整っている
- Discord-BDSXをWine環境で起動すると、エラーがでてDiscord-BDSXが起動しない
- Bashコマンドは基礎がわかる(~/表記や、cd及びls、環境変数など)

Wineの設定を弄っていない場合、 ~/.wine/dosdevices/c:/windows/system32 の直下に、Node.jsの公式サイトからWindows版バイナリをダウンロードしてきて、Node.exeを取り出す。
(ただし、Node.jsはv16.9.0 以上である必要があります。)

そして、LinuxのターミナルでNODE_SKIP_PLATFORM_CHECK環境変数に1を代入して、bdsx.shを実行すれば、おそらく完璧に動作するはずです。
> 上級者向けの注意書き:
この環境変数は、WineがCLI環境であり、winecfgを弄れない場合に行います。未検証ではありますが、Windows 10互換モードであれば環境変数の設定はいりません。
---
### English
> ### How to use in the Wine environment

Prerequisite :
- You have a Wine environment that can run BDSX.
- If you start Discord-BDSX in a Wine environment, you will get an error and Discord-BDSX will not start.
- Bash commands are basic (~/ notation, cd and ls, environment variables, etc.)

If you have not played with the Wine configuration, download the Windows binary from the official Node.js site directly under ~/.wine/dosdevices/c:/windows/system32 and extract Node.exe.
(Note that Node.js must be v16.9.0 or higher.)

Then, assign 1 to the NODE_SKIP_PLATFORM_CHECK environment variable in a Linux terminal and run bdsx.sh, and it should probably work perfectly.
> Advanced Notes :
This environment variable is done when Wine is a CLI environment and you cannot play with winecfg. Although untested, you do not need to set the environment variable if you are in Windows 10 compatibility mode.
