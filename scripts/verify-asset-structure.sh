#!/bin/bash

# Verify Asset Structure and Caching Strategy
# This script analyzes the build output to ensure proper asset organization

set -e

BUILD_DIR="${1:-node_modules/.cache/nuxt/.nuxt/dist/client}"
COLORS=true

# Colors
if [ "$COLORS" = "true" ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Asset Structure Verification Report${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
  echo -e "${RED}✗ Build directory not found: $BUILD_DIR${NC}"
  echo -e "${YELLOW}  Run 'pnpm build' first${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Build directory found${NC}"
echo ""

# 1. Check directory structure
echo -e "${BLUE}1. Directory Structure${NC}"
echo -e "${BLUE}----------------------${NC}"

check_directory() {
  local dir=$1
  local desc=$2
  if [ -d "$BUILD_DIR/$dir" ]; then
    local count=$(find "$BUILD_DIR/$dir" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${NC} $desc: ${GREEN}$count files${NC}"
  else
    echo -e "${RED}✗${NC} $desc: ${RED}NOT FOUND${NC}"
  fi
}

check_directory "assets/css" "CSS Assets"
check_directory "assets/images" "Image Assets"
check_directory "assets/fonts" "Font Assets"
check_directory "chunks" "JS Chunks"
check_directory "entries" "Entry Points"
echo ""

# 2. Check asset naming patterns
echo -e "${BLUE}2. Asset Naming Patterns${NC}"
echo -e "${BLUE}------------------------${NC}"

check_naming_pattern() {
  local dir=$1
  local pattern=$2
  local desc=$3

  if [ -d "$BUILD_DIR/$dir" ]; then
    local total=$(find "$BUILD_DIR/$dir" -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$total" -gt 0 ]; then
      local with_hash=$(find "$BUILD_DIR/$dir" -type f 2>/dev/null | grep -E "$pattern" | wc -l | tr -d ' ')
      local percentage=$((with_hash * 100 / total))

      if [ "$percentage" -eq 100 ]; then
        echo -e "${GREEN}✓${NC} $desc: ${GREEN}$with_hash/$total (${percentage}%)${NC}"
      elif [ "$percentage" -gt 80 ]; then
        echo -e "${YELLOW}⚠${NC} $desc: ${YELLOW}$with_hash/$total (${percentage}%)${NC}"
      else
        echo -e "${RED}✗${NC} $desc: ${RED}$with_hash/$total (${percentage}%)${NC}"
      fi
    else
      echo -e "${YELLOW}⚠${NC} $desc: ${YELLOW}No files found${NC}"
    fi
  fi
}

check_naming_pattern "assets/css" "-[a-zA-Z0-9_-]+\.css$" "CSS with hash"
check_naming_pattern "chunks" "-[a-zA-Z0-9_-]+\.js$" "Chunks with hash"
check_naming_pattern "entries" "-[a-zA-Z0-9_-]+\.js$" "Entries with hash"
echo ""

# 3. Analyze chunk sizes
echo -e "${BLUE}3. Chunk Size Analysis${NC}"
echo -e "${BLUE}----------------------${NC}"

if [ -d "$BUILD_DIR/chunks" ]; then
  echo -e "${BLUE}Top 10 largest chunks:${NC}"
  find "$BUILD_DIR/chunks" -type f -name "*.js" -exec du -h {} + 2>/dev/null | sort -hr | head -10 | while read size file; do
    filename=$(basename "$file")
    if [ "${size%K}" -gt 200 ] && [ "${size: -1}" = "K" ]; then
      echo -e "  ${RED}$size${NC} $filename"
    elif [ "${size%K}" -gt 100 ] && [ "${size: -1}" = "K" ]; then
      echo -e "  ${YELLOW}$size${NC} $filename"
    else
      echo -e "  ${GREEN}$size${NC} $filename"
    fi
  done
  echo ""

  # Total size
  local total_size=$(du -sh "$BUILD_DIR/chunks" 2>/dev/null | cut -f1)
  echo -e "Total chunks size: ${BLUE}$total_size${NC}"
else
  echo -e "${RED}✗ Chunks directory not found${NC}"
fi
echo ""

# 4. Check for vendor chunks
echo -e "${BLUE}4. Vendor Chunk Detection${NC}"
echo -e "${BLUE}-------------------------${NC}"

if [ -d "$BUILD_DIR/chunks" ]; then
  check_vendor_chunk() {
    local pattern=$1
    local desc=$2

    local count=$(find "$BUILD_DIR/chunks" -type f -name "*.js" 2>/dev/null | grep -i "$pattern" | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
      echo -e "${GREEN}✓${NC} $desc: ${GREEN}found ($count chunks)${NC}"
    else
      echo -e "${YELLOW}⚠${NC} $desc: ${YELLOW}not found${NC}"
    fi
  }

  check_vendor_chunk "vendor" "Vendor chunks"
  check_vendor_chunk "feature" "Feature chunks"

  # List actual vendor chunks
  local vendor_chunks=$(find "$BUILD_DIR/chunks" -type f -name "*.js" 2>/dev/null | grep -i "vendor" | wc -l | tr -d ' ')
  if [ "$vendor_chunks" -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Vendor chunks found:${NC}"
    find "$BUILD_DIR/chunks" -type f -name "*.js" 2>/dev/null | grep -i "vendor" | while read file; do
      local size=$(du -h "$file" | cut -f1)
      local name=$(basename "$file")
      echo -e "  $name (${GREEN}$size${NC})"
    done
  fi
else
  echo -e "${RED}✗ Chunks directory not found${NC}"
fi
echo ""

# 5. Check entry point size
echo -e "${BLUE}5. Entry Point Analysis${NC}"
echo -e "${BLUE}-----------------------${NC}"

if [ -d "$BUILD_DIR/entries" ]; then
  local entry_count=$(find "$BUILD_DIR/entries" -type f -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
  echo -e "Entry files: ${GREEN}$entry_count${NC}"

  find "$BUILD_DIR/entries" -type f -name "*.js" -exec du -h {} + 2>/dev/null | while read size file; do
    filename=$(basename "$file")
    # Check if size is in KB and greater than 500
    if [ "${size%K}" -gt 500 ] && [ "${size: -1}" = "K" ]; then
      echo -e "  ${RED}$size${NC} $filename ${RED}(Consider code splitting)${NC}"
    elif [ "${size%K}" -gt 300 ] && [ "${size: -1}" = "K" ]; then
      echo -e "  ${YELLOW}$size${NC} $filename ${YELLOW}(Monitor size)${NC}"
    else
      echo -e "  ${GREEN}$size${NC} $filename"
    fi
  done
else
  echo -e "${RED}✗ Entries directory not found${NC}"
fi
echo ""

# 6. CSS Analysis
echo -e "${BLUE}6. CSS Bundle Analysis${NC}"
echo -e "${BLUE}----------------------${NC}"

if [ -d "$BUILD_DIR/assets/css" ]; then
  local css_count=$(find "$BUILD_DIR/assets/css" -type f -name "*.css" 2>/dev/null | wc -l | tr -d ' ')
  local total_css_size=$(du -sh "$BUILD_DIR/assets/css" 2>/dev/null | cut -f1)

  echo -e "CSS files: ${GREEN}$css_count${NC}"
  echo -e "Total CSS size: ${BLUE}$total_css_size${NC}"
  echo ""

  echo -e "${BLUE}Top 5 largest CSS files:${NC}"
  find "$BUILD_DIR/assets/css" -type f -name "*.css" -exec du -h {} + 2>/dev/null | sort -hr | head -5 | while read size file; do
    filename=$(basename "$file")
    echo -e "  ${GREEN}$size${NC} $filename"
  done
else
  echo -e "${RED}✗ CSS assets directory not found${NC}"
fi
echo ""

# 7. Summary and Recommendations
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Summary & Recommendations${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Calculate scores
score=0
max_score=0

# Directory structure (5 points each)
for dir in "assets/css" "chunks" "entries"; do
  max_score=$((max_score + 5))
  if [ -d "$BUILD_DIR/$dir" ]; then
    score=$((score + 5))
  fi
done

# Asset naming (10 points)
max_score=$((max_score + 10))
if [ -d "$BUILD_DIR/chunks" ]; then
  local total=$(find "$BUILD_DIR/chunks" -type f 2>/dev/null | wc -l | tr -d ' ')
  if [ "$total" -gt 0 ]; then
    local with_hash=$(find "$BUILD_DIR/chunks" -type f 2>/dev/null | grep -E "-[a-zA-Z0-9_-]+\.js$" | wc -l | tr -d ' ')
    local percentage=$((with_hash * 100 / total))
    if [ "$percentage" -eq 100 ]; then
      score=$((score + 10))
    elif [ "$percentage" -gt 80 ]; then
      score=$((score + 7))
    elif [ "$percentage" -gt 50 ]; then
      score=$((score + 5))
    fi
  fi
fi

# Calculate percentage
percentage=$((score * 100 / max_score))

echo -e "Configuration Score: ${BLUE}$score/$max_score${NC} (${percentage}%)"
echo ""

if [ "$percentage" -ge 90 ]; then
  echo -e "${GREEN}✓ Excellent!${NC} Asset structure is properly optimized."
  echo -e "  Your configuration follows best practices for long-term caching."
elif [ "$percentage" -ge 70 ]; then
  echo -e "${YELLOW}⚠ Good${NC} but could be improved."
  echo -e "  Consider reviewing the recommendations below."
else
  echo -e "${RED}✗ Needs Improvement${NC}"
  echo -e "  Please review the configuration and apply recommended fixes."
fi
echo ""

echo -e "${BLUE}Recommendations:${NC}"
echo -e "1. Ensure all assets have content-based hashes"
echo -e "2. Monitor chunk sizes (target <200KB per chunk)"
echo -e "3. Use vendor chunking for better cache granularity"
echo -e "4. Configure immutable cache headers in production"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo -e "1. Deploy to production"
echo -e "2. Verify cache headers with: ${YELLOW}curl -I <asset-url>${NC}"
echo -e "3. Monitor cache hit rates in analytics"
echo -e "4. Run performance tests with Lighthouse"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Verification Complete${NC}"
echo -e "${BLUE}========================================${NC}"
