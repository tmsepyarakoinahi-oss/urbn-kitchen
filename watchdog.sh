#!/bin/bash
while true; do
  if ! curl -s -o /dev/null --max-time 5 http://127.0.0.1:3000/ 2>/dev/null | grep -q ""; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:3000/ 2>/dev/null)
    if [ "$STATUS" != "200" ]; then
      echo "[$(date)] Server down (HTTP=$STATUS), restarting..." >> /home/z/my-project/watchdog.log
      pkill -9 -f "server.js" 2>/dev/null
      sleep 2
      nohup node /home/z/my-project/.next/standalone/server.js >> /home/z/my-project/dev.log 2>&1 &
      sleep 3
    fi
  fi
  sleep 5
done
