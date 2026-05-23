#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting production server..."
  NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE"
  sleep 5
done
