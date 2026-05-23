#!/bin/bash
# Robust keepalive script for the dev server
# Watches and auto-restarts if server crashes

LOG="/home/z/my-project/dev.log"
PID_FILE="/home/z/my-project/.server-pid"
CHECK_INTERVAL=10

cd /home/z/my-project

start_server() {
  # Kill any existing server
  pkill -f "next dev" 2>/dev/null
  sleep 2
  
  # Start fresh
  node node_modules/.bin/next dev -p 3000 > "$LOG" 2>&1 &
  SERVER_PID=$!
  echo $SERVER_PID > "$PID_FILE"
  echo "[$(date)] Started server PID: $SERVER_PID"
  
  # Wait for ready
  for i in $(seq 1 30); do
    sleep 1
    if grep -q "Ready" "$LOG" 2>/dev/null; then
      echo "[$(date)] Server ready after ${i}s"
      return 0
    fi
    if ! kill -0 $SERVER_PID 2>/dev/null; then
      echo "[$(date)] Server died during startup"
      return 1
    fi
  done
  echo "[$(date)] Server startup timeout"
  return 1
}

check_server() {
  # Check if process exists
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if kill -0 $pid 2>/dev/null; then
      # Process exists, check if it responds
      if curl -s -o /dev/null -w "" http://127.0.0.1:3000/ 2>/dev/null; then
        return 0
      fi
    fi
  fi
  return 1
}

# Initial start
start_server

# Watch loop
while true; do
  sleep $CHECK_INTERVAL
  if ! check_server; then
    echo "[$(date)] Server down, restarting..."
    start_server
  fi
done
