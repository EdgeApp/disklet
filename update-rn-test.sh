#!/bin/sh
# Copies the latest disklet code into the React Native test folder

if [ ! -d ./ReactNativeDiskletTest/node_modules/disklet/ ]; then
  echo 'Please run yarn inside the ReactNativeDiskletTest folder first'
  exit 1
fi

npm run prepare

rm -r ./ReactNativeDiskletTest/node_modules/disklet/lib/
cp -r android disklet.podspec ios package.json lib ./ReactNativeDiskletTest/node_modules/disklet/
