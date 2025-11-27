#!/bin/bash

echo "========================================"
echo "Restarting Dev Server in Correct Directory"
echo "========================================"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Working directory: $SCRIPT_DIR"
echo ""

# Kill any existing nuxt dev servers
echo "1. Stopping any existing Nuxt dev servers..."
pkill -f "nuxt dev" || echo "   No existing servers found"
sleep 2
echo "   ✓ Servers stopped"
echo ""

# Clear Nuxt cache
echo "2. Clearing Nuxt cache..."
cd "$SCRIPT_DIR"
rm -rf .nuxt
echo "   ✓ .nuxt directory removed"
echo ""

# Clear Vite cache
echo "3. Clearing Vite cache..."
rm -rf node_modules/.vite
echo "   ✓ Vite cache removed"
echo ""

# Verify we're in the correct directory
echo "4. Verifying directory..."
if [ -f "package.json" ]; then
    echo "   ✓ package.json found"
else
    echo "   ✗ package.json not found - wrong directory!"
    exit 1
fi
echo ""

# Start dev server
echo "5. Starting dev server..."
echo "   Running: npm run dev"
echo ""
echo "========================================"
echo "Dev server starting at http://localhost:3000"
echo "========================================"
echo ""

npm run dev
