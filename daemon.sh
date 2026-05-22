#!/bin/bash
# Double-fork to fully detach from parent
(cd /home/z/my-project && NODE_OPTIONS="--max-old-space-size=256" node .next/standalone/server.js >> /home/z/my-project/dev.log 2>&1) &
# Exit immediately so the parent shell can return
exit 0
