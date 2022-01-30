#!/bin/sh
rm -rf /code/*
mkdir -p /code
mkdir -p /log

exec node server.js -s "$(cat /dev/urandom | head -1 | md5sum | head -c 10)"