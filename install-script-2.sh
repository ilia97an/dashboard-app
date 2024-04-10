#!/bin/bash
set -e

while true; do
  log="$HOME/.npm/_logs/`ls $HOME/.npm/_logs/ | tail -n 1`"
  echo "log: $log"
  for path in `cat "$log" | grep 'ENOTEMPTY' | grep -oE "[^']+node_modules[^']+" | grep -oE "node_modules[^$]+"`; do
    path="/opt/node/lib/"$path
    echo "removing $path"
    rm -rf "$path"
  done
  if npm install -g next; then
    break
  fi
done
