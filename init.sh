#!/bin/bash

# Moldova Direct - Initialization & Testing Script
# This script guides you through starting the development server and running tests

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Welcome message
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Moldova Direct - Initialization Script       ║${NC}"
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo ""

# Check prerequisites
print_step "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 22.4.0 or higher."
    exit 1
fi

if ! command_exists pnpm; then
    print_error "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    print_warning "Node.js version is below 22.4.0. Please upgrade for best compatibility."
else
    print_success "Node.js version is compatible ($(node -v))"
fi

print_success "pnpm is installed ($(pnpm -v))"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. You'll need to create one with Supabase credentials."
    echo ""
    echo "Required environment variables:"
    echo "  SUPABASE_URL=https://[project].supabase.co"
    echo "  SUPABASE_KEY=[anon_key]"
    echo "  SUPABASE_SERVICE_KEY=[service_key]"
    echo "  APP_URL=http://localhost:3000"
    echo ""
fi

# Install dependencies
print_step "Installing dependencies..."
if [ -d "node_modules" ]; then
    print_success "Dependencies already installed. Skipping..."
else
    pnpm install
    print_success "Dependencies installed successfully"
fi

# Setup Playwright browsers
print_step "Checking Playwright browsers..."
if pnpm exec playwright --version >/dev/null 2>&1; then
    print_success "Playwright is installed"
    read -p "Do you want to install/update Playwright browsers? (y/N): " install_browsers
    if [[ $install_browsers =~ ^[Yy]$ ]]; then
        pnpm test:setup
        print_success "Playwright browsers installed"
    fi
else
    print_warning "Playwright not found. Installing..."
    pnpm test:setup
fi

# Clean cache option
read -p "Do you want to clean the build cache? (y/N): " clean_cache
if [[ $clean_cache =~ ^[Yy]$ ]]; then
    print_step "Cleaning cache..."
    pkill -9 node 2>/dev/null || true
    rm -rf .nuxt node_modules/.vite .output
    print_success "Cache cleaned"
fi

# Start development server
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Starting Development Server            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

print_step "Starting Nuxt development server on http://localhost:3000"
echo ""
print_warning "Press Ctrl+C to stop the server"
echo ""
echo "Available npm scripts:"
echo "  ${GREEN}npm run dev${NC}              - Start dev server"
echo "  ${GREEN}npm run build${NC}            - Build for production"
echo "  ${GREEN}npm run test${NC}             - Run all E2E tests"
echo "  ${GREEN}npm run test:critical${NC}    - Run critical tests only"
echo "  ${GREEN}npm run test:unit${NC}        - Run unit tests"
echo "  ${GREEN}npm run test:visual${NC}      - Run visual regression tests"
echo ""

# Ask if user wants to start the server now
read -p "Start the development server now? (Y/n): " start_server
if [[ ! $start_server =~ ^[Nn]$ ]]; then
    print_step "Launching development server..."
    echo ""
    npm run dev
else
    echo ""
    print_success "Setup complete! Run 'npm run dev' when ready."
    echo ""
    echo -e "${YELLOW}Testing Commands:${NC}"
    echo "  npm run test              # Run all E2E tests"
    echo "  npm run test:critical     # Run critical tests"
    echo "  npm run test:unit         # Run unit tests"
    echo "  npm run test:visual       # Visual regression tests"
    echo ""
    echo -e "${YELLOW}Development:${NC}"
    echo "  npm run dev               # Start dev server"
    echo "  npm run build             # Production build"
    echo ""
fi
