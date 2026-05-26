#!/bin/bash
cd /home/z/my-project

# Start server
NODE_OPTIONS="--max-old-space-size=256" node .next/standalone/server.js &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Keepalive loop
while true; do
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "Server died, restarting..."
    NODE_OPTIONS="--max-old-space-size=256" node .next/standalone/server.js &
    SERVER_PID=$!
  fi
  curl -s -o /dev/null --max-time 5 http://127.0.0.1:3000/ 2>/dev/null
  sleep 2
done
