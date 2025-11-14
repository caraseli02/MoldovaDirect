#!/bin/bash

# Monitor Moldova Direct deployment until it's healthy
URL="https://moldova-direct.vercel.app/"
MAX_ATTEMPTS=60  # 10 minutes (60 * 10 seconds)
ATTEMPT=0

echo "🔍 Monitoring deployment: $URL"
echo "Checking every 10 seconds for up to 10 minutes..."
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))

  # Get HTTP status and error header
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  VERCEL_ERROR=$(curl -s -I "$URL" | grep -i "x-vercel-error" | cut -d' ' -f2- | tr -d '\r')

  TIMESTAMP=$(date "+%H:%M:%S")

  if [ "$HTTP_STATUS" = "200" ] && [ -z "$VERCEL_ERROR" ]; then
    echo ""
    echo "✅ SUCCESS! Deployment is live and healthy!"
    echo "   Status: $HTTP_STATUS"
    echo "   Time: $TIMESTAMP"
    echo "   URL: $URL"
    echo ""

    # Fetch the page to verify SSR worked
    echo "Verifying SSR content..."
    CONTENT=$(curl -s "$URL" | head -50)
    if echo "$CONTENT" | grep -q "Moldova Direct"; then
      echo "✅ SSR working - page contains 'Moldova Direct'"
    else
      echo "⚠️  Warning: Page loaded but might not have full SSR content"
    fi

    exit 0
  else
    if [ $((ATTEMPT % 6)) -eq 0 ]; then
      # Print status every minute
      echo "[$TIMESTAMP] Attempt $ATTEMPT/$MAX_ATTEMPTS - Status: $HTTP_STATUS${VERCEL_ERROR:+ | Error: $VERCEL_ERROR}"
    fi
  fi

  sleep 10
done

echo ""
echo "❌ Timeout: Deployment still not healthy after 10 minutes"
echo "   Last status: $HTTP_STATUS"
echo "   Last error: ${VERCEL_ERROR:-none}"
exit 1
