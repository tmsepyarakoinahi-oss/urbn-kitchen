#!/bin/bash
trap 'echo "Received signal - ignoring"' SIGTERM SIGINT SIGHUP
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=4096"

while true; do
  echo "Starting production server..."
  node .next/standalone/server.js -p 3000 2>&1
  EXIT_CODE=$?
  echo "Server exited with code $EXIT_CODE"
  echo "Restarting in 2 seconds..."
  sleep 2
done
