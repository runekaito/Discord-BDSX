#! /bin/bash
if [ ! -f ~/.wine/dosdevices/c:/windows/system32/node.exe ]; then
sudo wget -O ~/.wine/dosdevices/c:/windows/system32/node.exe https://nodejs.org/dist/v18.13.0/win-x64/node.exe
fi
export NODE_SKIP_PLATFORM_CHECK=1
if [ -f ./bdsx.sh ]; then
 ./bdsx.sh
else
 echo "Place it in the BDSX root directory."
fi
