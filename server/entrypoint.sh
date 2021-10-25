#!/bin/sh
rm -rf /code/*
mkdir -p /code
mkdir -p /log

chown compiler:server /code
chmod 711 /code

exec node server.js