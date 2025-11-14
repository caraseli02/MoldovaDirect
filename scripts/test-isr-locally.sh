#!/bin/bash
# Test ISR rendering locally to reproduce FUNCTION_INVOCATION_FAILED conditions

echo "🧪 Testing ISR Rendering Locally..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Server not running on http://localhost:3000"
  echo ""
  echo "Start the server first:"
  echo "  pnpm run build && pnpm run preview"
  echo "  OR"
  echo "  vercel dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Function to test a URL and measure time
test_endpoint() {
  local url=$1
  local name=$2

  echo "Testing: $name"
  echo "URL: $url"

  # Measure response time
  local start=$(date +%s%N)
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  local end=$(date +%s%N)

  local duration=$(( (end - start) / 1000000 ))

  if [ "$status" = "200" ]; then
    if [ "$duration" -lt 1000 ]; then
      echo "✅ Status: $status | Duration: ${duration}ms | FAST"
    elif [ "$duration" -lt 2000 ]; then
      echo "⚠️  Status: $status | Duration: ${duration}ms | ACCEPTABLE"
    else
      echo "🐌 Status: $status | Duration: ${duration}ms | SLOW (potential timeout risk)"
    fi
  else
    echo "❌ Status: $status | Duration: ${duration}ms | FAILED"
  fi

  echo ""
}

# Test homepage (ISR route)
echo "=== ISR Routes ==="
echo ""
test_endpoint "http://localhost:3000/" "Homepage (ISR)"
test_endpoint "http://localhost:3000/products" "Products Page (ISR)"

# Test API endpoints that are called during ISR
echo "=== API Endpoints (called during ISR) ==="
echo ""
test_endpoint "http://localhost:3000/api/products/featured?limit=12" "Featured Products API"
test_endpoint "http://localhost:3000/api/products?limit=24" "Products List API"
test_endpoint "http://localhost:3000/api/categories" "Categories API"

echo "=== Summary ==="
echo ""
echo "If you see:"
echo "  ✅ All routes < 1s: Fixes are working!"
echo "  ⚠️  Routes 1-2s: Should be OK, but monitor in production"
echo "  🐌 Routes > 2s: Still has performance issues"
echo "  ❌ Status 500: Error still occurring"
echo ""
echo "To see detailed logs, check the terminal running 'pnpm preview'"
