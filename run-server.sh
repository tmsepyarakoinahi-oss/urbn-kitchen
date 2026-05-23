#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=2048"

# Warm up - hit all endpoints to pre-load modules
node .next/standalone/server.js -p 3000 &
PID=$!
sleep 3

# Pre-warm the server by hitting all key routes
echo "Warming up server..."
wget -q -O /dev/null http://localhost:3000/ 2>/dev/null
wget -q -O /dev/null http://localhost:3000/api/products?limit=1 2>/dev/null
wget -q -O /dev/null http://localhost:3000/api/categories 2>/dev/null
wget -q -O /dev/null http://localhost:3000/api/amc 2>/dev/null
wget -q -O /dev/null http://localhost:3000/api/seed 2>/dev/null

echo "Server warmed up and running on port 3000"
echo "PID: $PID"

# Keep the script running to keep the server alive
while kill -0 $PID 2>/dev/null; do
  sleep 10
done
echo "Server exited"
