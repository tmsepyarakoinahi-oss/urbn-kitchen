#!/bin/bash
cd /home/z/my-project

# Start the server in background
node .next/standalone/server.js &
SERVER_PID=$!

# Keepalive loop - pings the server every 2 seconds
while kill -0 $SERVER_PID 2>/dev/null; do
  curl -s -o /dev/null --max-time 3 http://127.0.0.1:3000/ 2>/dev/null
  sleep 2
done

echo "Server died, restarting..."
exec $0
