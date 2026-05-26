#!/bin/bash
cd /home/z/my-project
while true; do
  echo "Starting server..."
  NODE_OPTIONS="--max-old-space-size=2048" npx next dev -p 3000 2>&1
  echo "Server exited, restarting in 3 seconds..."
  sleep 3
done
