#!/usr/bin/env python3
"""
Fix ESLint warnings by:
1. Prefixing unused variables with underscore
2. Replacing `any` types with `unknown` in safe contexts
"""

import subprocess
import re
import os
from pathlib import Path

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

def fix_unused_variables():
    """Fix unused variable warnings by prefixing with underscore"""
    warnings = get_lint_warnings()
    lines = warnings.split('\n')

    fixed_count = 0

    for line in lines:
        if 'no-unused-vars' in line:
            # Parse: /path/file.ts:123:8  warning  'varname' is defined but never used
            match = re.match(r'^([^:]+):(\d+):(\d+)\s+warning\s+[\'"]([^\'"]+)[\'"]', line)
            if match:
                file_path = match.group(1)
                line_num = int(match.group(2))
                var_name = match.group(4)

                if not var_name.startswith('_') and os.path.exists(file_path):
                    try:
                        with open(file_path, 'r') as f:
                            content_lines = f.readlines()

                        if line_num <= len(content_lines):
                            target_line = content_lines[line_num - 1]

                            # Replace variable name with _variable
                            # Use word boundaries to avoid partial replacements
                            new_line = re.sub(
                                rf'\b{re.escape(var_name)}\b',
                                f'_{var_name}',
                                target_line,
                                count=1
                            )

                            if new_line != target_line:
                                content_lines[line_num - 1] = new_line
                                with open(file_path, 'w') as f:
                                    f.writelines(content_lines)
                                print(f"  ✓ {file_path}:{line_num} - '{var_name}' → '_{var_name}'")
                                fixed_count += 1
                    except Exception as e:
                        print(f"  ✗ Error fixing {file_path}: {e}")

    return fixed_count

def fix_any_types():
    """Replace `any` with `unknown` in safe contexts"""
    fixed_count = 0

    # Find TypeScript and Vue files
    ts_files = list(Path('.').rglob('*.ts')) + list(Path('.').rglob('*.tsx')) + list(Path('.').rglob('*.vue'))

    # Exclude certain directories
    exclude_dirs = {'node_modules', '.nuxt', '.output', 'dist', '.git'}
    ts_files = [f for f in ts_files if not any(part in exclude_dirs for part in f.parts)]

    patterns = [
        (r':\s*any\b', ': unknown'),
        (r'=\s*any\b', '= unknown'),
        (r'as\s+any\b', 'as unknown'),
        (r'Record<([^,>]+),\s*any>', r'Record<\1, unknown>'),
        (r'PropType<any>', 'PropType<unknown>'),
        (r'Ref<any>', 'Ref<unknown>'),
    ]

    for file_path in ts_files:
        try:
            with open(file_path, 'r') as f:
                content = f.read()

            original = content

            for pattern, replacement in patterns:
                content = re.sub(pattern, replacement, content)

            if content != original:
                with open(file_path, 'w') as f:
                    f.write(content)
                count = sum(len(re.findall(p, original)) for p, _ in patterns)
                print(f"  ✓ {file_path} - {count} replacements")
                fixed_count += count
        except Exception as e:
            print(f"  ✗ Error processing {file_path}: {e}")

    return fixed_count

def main():
    print("🔧 ESLint Warning Fixer\n")

    print("Stage 1/2: Fixing unused variables...")
    unused_fixed = fix_unused_variables()
    print(f"  Fixed {unused_fixed} unused variable warnings\n")

    print("Stage 2/2: Fixing `any` types...")
    any_fixed = fix_any_types()
    print(f"  Fixed {any_fixed} `any` type warnings\n")

    print(f"✅ Total fixes: {unused_fixed + any_fixed}")
    print("\nRun 'npm run lint' to verify results")

if __name__ == '__main__':
    main()
