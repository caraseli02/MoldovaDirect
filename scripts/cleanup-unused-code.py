#!/usr/bin/env python3
"""
Smart cleanup of unused variables with two-phase approach:

Phase 1: Remove only the SAFEST variables (standalone declarations)
Phase 2: Prefix complex cases with underscore (fallback for code safety)

This balances clean code with safety - removes obvious dead code,
falls back to underscore for complex cases that need manual review.
"""

import subprocess
import re
import os
from pathlib import Path
from typing import List, Tuple, Optional, Dict

def get_lint_warnings():
    """Get ESLint warnings"""
    try:
        result = subprocess.run(
            ['npm', 'run', 'lint'],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        return result.stdout + result.stderr
    except Exception as e:
        print(f"Error running lint: {e}")
        return ""

def is_safe_to_remove(file_path: str, line_num: int, var_name: str) -> bool:
    """
    Determine if it's safe to completely remove the variable.
    Returns True only for the SAFEST cases.
    """
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()

        if line_num > len(lines):
            return False

        target_line = lines[line_num - 1]

        # SKIP: Already has underscore
        if var_name.startswith('_'):
            return False

        # SKIP: Event handlers and lifecycle hooks (may be intentional)
        if re.search(r'(on[A-Z]|mounted|unmounted|created|destroyed|setup|watch|computed)\s*[:(]', target_line):
            return False

        # SKIP: Arrow functions with multiple params (e.g., (a, b) => {})
        if '=>' in target_line and ',' in target_line.split('(')[0:1]:
            return False

        # SKIP: Contains callbacks or async operations
        if 'async' in target_line or '.then' in target_line or '.catch' in target_line:
            return False

        # SKIP: Contains destructuring with spread operator
        if '...' in target_line:
            return False

        # SAFE: Standalone const/let/var declaration on single line
        # Pattern: const x = value;
        if re.match(rf'^\s*(const|let|var)\s+{re.escape(var_name)}\s*=\s*.+[;,]?\s*$', target_line):
            # Make sure it's not part of a destructuring
            if '{' not in target_line and '}' not in target_line:
                return True

        # SAFE: Simple destructuring removal: const { x, y } = obj
        # Only if we can safely remove from destructuring
        if '{' in target_line and '}' in target_line and '=' in target_line:
            # Don't remove if it's a function parameter destructuring
            if '(' not in target_line or ')' not in target_line:
                return True

        return False
    except Exception:
        return False

def safe_remove_variable(file_path: str, line_num: int, var_name: str) -> bool:
    """Safely remove a variable declaration"""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()

        if line_num > len(lines):
            return False

        target_line = lines[line_num - 1]

        # Remove entire line for standalone declarations
        if re.match(rf'^\s*(const|let|var)\s+{re.escape(var_name)}\s*=\s*.+[;,]?\s*$', target_line):
            if '{' not in target_line and '}' not in target_line:
                del lines[line_num - 1]
                with open(file_path, 'w') as f:
                    f.writelines(lines)
                return True

        # Remove from destructuring: const { x, y } = obj
        if '{' in target_line and '}' in target_line and '=' in target_line:
            new_line = re.sub(
                rf',?\s*{re.escape(var_name)}\s*(?=[,}}])',
                '',
                target_line
            )
            # Clean up spacing
            new_line = re.sub(r',\s*,', ',', new_line)
            new_line = re.sub(r'{\s*,', '{ ', new_line)
            new_line = re.sub(r',\s*}', ' }', new_line)
            new_line = re.sub(r'{\s*}', '{}', new_line)

            if new_line != target_line and '{ }' not in new_line:
                lines[line_num - 1] = new_line
                with open(file_path, 'w') as f:
                    f.writelines(lines)
                return True

        return False
    except Exception:
        return False

def prefix_with_underscore(file_path: str, line_num: int, var_name: str) -> bool:
    """Add underscore prefix to variable name"""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()

        if line_num > len(lines):
            return False

        target_line = lines[line_num - 1]

        # Replace variable name with _variable using word boundaries
        new_line = re.sub(
            rf'\b{re.escape(var_name)}\b',
            f'_{var_name}',
            target_line,
            count=1
        )

        if new_line != target_line:
            lines[line_num - 1] = new_line
            with open(file_path, 'w') as f:
                f.writelines(lines)
            return True

        return False
    except Exception:
        return False

def cleanup_unused_code():
    """
    Phase 1: Remove safe variables
    Phase 2: Prefix complex cases with underscore
    """
    warnings = get_lint_warnings()
    lines = warnings.split('\n')

    removed_count = 0
    prefixed_count = 0
    skipped_count = 0
    seen = {}
    current_file = None

    for line in lines:
        # Track current file
        if line.startswith('/') and not line.startswith('  '):
            current_file = line.strip()
            continue

        if 'no-unused-vars' in line and current_file:
            # Parse: 123:8  warning  'varname' is defined but never used
            match = re.match(r'\s*(\d+):(\d+)\s+warning\s+[\'"]([^\'"]+)[\'"]', line)
            if not match:
                continue

            file_path = current_file
            line_num = int(match.group(1))
            var_name = match.group(3)

            # Skip already prefixed
            if var_name.startswith('_'):
                continue

            # Skip duplicates
            key = f"{file_path}:{line_num}:{var_name}"
            if key in seen:
                continue
            seen[key] = True

            if not os.path.exists(file_path):
                continue

            # Phase 1: Try to remove safely
            if is_safe_to_remove(file_path, line_num, var_name):
                if safe_remove_variable(file_path, line_num, var_name):
                    rel_path = file_path.lstrip('./')
                    print(f"  ✓ Removed: {rel_path}:{line_num} - '{var_name}'")
                    removed_count += 1
                else:
                    skipped_count += 1
            else:
                # Phase 2: Prefix with underscore (fallback for safety)
                if prefix_with_underscore(file_path, line_num, var_name):
                    rel_path = file_path.lstrip('./')
                    print(f"  → Prefixed: {rel_path}:{line_num} - '{var_name}' → '_{var_name}'")
                    prefixed_count += 1
                else:
                    skipped_count += 1

    return removed_count, prefixed_count, skipped_count

def main():
    print("🧹 Smart Cleanup of Unused Variables\n")

    print("Phase 1/2: Removing safe unused variables...")
    print("Phase 2/2: Prefixing complex cases with underscore...\n")

    removed, prefixed, skipped = cleanup_unused_code()

    print(f"\n📊 Results:")
    print(f"  Removed:  {removed} (safe standalone declarations)")
    print(f"  Prefixed: {prefixed} (complex cases requiring underscore)")
    print(f"  Skipped:  {skipped} (couldn't process)")
    print(f"  Total:    {removed + prefixed + skipped}")

    if removed > 0 or prefixed > 0:
        print(f"\n✅ Cleaned up {removed + prefixed} unused variables")
        print("   Run 'npm run lint' to verify results")
        if prefixed > 0:
            print(f"\n⚠️  {prefixed} variables prefixed with _ (safer than removal)")
            print("   These can be reviewed and removed manually if needed")
    else:
        print("\n✅ No changes needed")

if __name__ == '__main__':
    main()
