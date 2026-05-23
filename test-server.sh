#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=2048"

# Start the server
node .next/standalone/server.js -p 3000 &
PID=$!
echo "Server PID: $PID"
sleep 5

# Test homepage
echo -n "Homepage: " && wget -q -O /dev/null http://localhost:3000 && echo "✓" || echo "✗"

# Test products
echo -n "Products API: " && wget -q -O /tmp/prods.json http://localhost:3000/api/products?limit=2 && echo "✓" || echo "✗"

# Test categories
echo -n "Categories API: " && wget -q -O /tmp/cats.json http://localhost:3000/api/categories && echo "✓" || echo "✗"

# Test AMC
echo -n "AMC API: " && wget -q -O /tmp/amc.json http://localhost:3000/api/amc && echo "✓" || echo "✗"

# Test seed
echo -n "Seed API: " && wget -q -O /tmp/seed.json http://localhost:3000/api/seed && echo "✓" || echo "✗"

# Check process still alive
if kill -0 $PID 2>/dev/null; then
  echo "✅ Server is still alive after all tests"
else
  echo "❌ Server died during tests"
fi

# Show data
echo "=== Products Data ==="
python3 -c "import json; d=json.load(open('/tmp/prods.json')); print(f'Total: {d.get(\"total\",\"N/A\")} products')" 2>/dev/null

echo "=== Categories Data ==="
python3 -c "import json; d=json.load(open('/tmp/cats.json')); cats=d if isinstance(d,list) else d.get('categories',d.get('data',[])); print(f'{len(cats)} categories'); [print(f'  - {c[\"name\"]}') for c in cats[:5]]" 2>/dev/null

# Keep server running
echo "Keeping server alive on port 3000..."
wait $PID
