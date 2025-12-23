#!/bin/bash

# Fix unused variables by prefixing with underscore

echo "🔧 Fixing unused variables..."
echo ""

# Get all unused variable warnings and fix them
npm run lint 2>&1 | grep "no-unused-vars" | while read line; do
  # Extract file path and line number
  file=$(echo "$line" | grep -oE "^/[^:]*" | head -1)
  linenum=$(echo "$line" | grep -oE "^[^:]*:[0-9]*" | grep -oE "[0-9]*$")
  varname=$(echo "$line" | grep -oE "'[^']*' is" | sed "s/'//g" | sed "s/ is//")

  if [[ -n "$file" && -n "$linenum" && -n "$varname" ]]; then
    # Check if variable already has underscore
    if [[ ! "$varname" =~ ^_ ]]; then
      # Get the line content
      actualline=$(sed -n "${linenum}p" "$file")

      # Replace the variable with underscore prefix
      newline=$(echo "$actualline" | sed "s/\b${varname}\b/_${varname}/")

      if [[ "$actualline" != "$newline" ]]; then
        # Use sed to replace the line
        sed -i "" "${linenum}s/.*/$(echo "$newline" | sed 's/[&/\]/\\&/g')/" "$file"
        echo "  Fixed: $file:$linenum - $varname → _$varname"
      fi
    fi
  fi
done

echo ""
echo "✅ Unused variables fixed"
