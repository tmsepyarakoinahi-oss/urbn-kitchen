#!/bin/bash
while true; do
  curl -s -o /dev/null --max-time 5 http://127.0.0.1:3000/ 2>/dev/null
  sleep 3
done
