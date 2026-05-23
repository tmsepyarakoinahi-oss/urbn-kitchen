#!/bin/bash
# Persistent server wrapper for sandbox environment
# Restarts the server automatically when it crashes

cd /home/z/my-project

while true; do
  echo "[$(date '+%H:%M:%S')] Starting production server..." >> /home/z/my-project/server-wrapper.log
  
  NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js >> /home/z/my-project/server-wrapper.log 2>&1
  EXIT=$?
  
  echo "[$(date '+%H:%M:%S')] Server exited with code $EXIT" >> /home/z/my-project/server-wrapper.log
  sleep 3
done
