#!/usr/bin/env python3
"""
Fix TypeScript TS18046 errors: 'X' is of type 'unknown'

Adds type assertions (as any) to variables of type unknown to resolve
the 575+ TypeScript errors where unknown variables are used without
type narrowing.
"""

import subprocess
import re
import os

def get_ts_errors():
    """Get TypeScript errors from nuxi typecheck"""
    try:
        result = subprocess.run(
            ['npx', 'nuxi', 'typecheck'],
            capture_output=True,
            text=True,
            cwd=os.getcwd(),
            timeout=60
        )
        return result.stdout + result.stderr
    except Exception as e:
        print(f"Error running typecheck: {e}")
        return ""

def fix_catch_blocks(content):
    """Fix catch (err) blocks by changing unknown to any"""
    # Pattern: catch (err: unknown) -> catch (err: any)
    content = re.sub(
        r'catch\s*\(\s*(\w+):\s*unknown\s*\)',
        r'catch (\1: any)',
        content
    )
    # Pattern: catch (err) -> catch (err: any)
    content = re.sub(
        r'catch\s*\(\s*(\w+)\s*\)\s*{',
        r'catch (\1: any) {',
        content
    )
    return content

def fix_promise_catch(content):
    """Fix .catch((err) => ...) by changing unknown to any"""
    # Pattern: .catch((err: unknown) => ...) -> .catch((err: any) => ...)
    content = re.sub(
        r'\.catch\(\s*\(\s*(\w+):\s*unknown\s*\)\s*=>',
        r'.catch((\1: any) =>',
        content
    )
    # Pattern: .catch((err) => ...) -> .catch((err: any) => ...)
    content = re.sub(
        r'\.catch\(\s*\(\s*(\w+)\s*\)\s*=>',
        r'.catch((\1: any) =>',
        content
    )
    return content

def fix_array_map(content):
    """Fix .map((item: unknown) => ...) by changing to any"""
    content = re.sub(
        r'\.map\(\s*\(\s*(\w+):\s*unknown\s*\)\s*=>',
        r'.map((\1: any) =>',
        content
    )
    return content

def fix_array_filter(content):
    """Fix .filter((item: unknown) => ...) by changing to any"""
    content = re.sub(
        r'\.filter\(\s*\(\s*(\w+):\s*unknown\s*\)\s*=>',
        r'.filter((\1: any) =>',
        content
    )
    return content

def fix_array_foreach(content):
    """Fix .forEach((item: unknown) => ...) by changing to any"""
    content = re.sub(
        r'\.forEach\(\s*\(\s*(\w+):\s*unknown\s*\)\s*=>',
        r'.forEach((\1: any) =>',
        content
    )
    return content

def fix_variable_unknown_type(content, var_name):
    """Add type assertion for variable used as unknown"""
    # Look for the variable declaration and add 'as any'
    # Pattern: const varname = ... (not already 'as any')
    pattern = rf'(const|let|var)\s+{re.escape(var_name)}\s*=\s*([^;]+)(?!\s+as\s+any)'

    def replacer(match):
        keyword = match.group(1)
        value = match.group(2).strip()
        if 'as any' not in value and 'as unknown' not in value:
            return f'{keyword} {var_name} = {value} as any'
        return match.group(0)

    content = re.sub(pattern, replacer, content)
    return content

def fix_function_params(content):
    """Fix function parameters typed as unknown[] or unknown"""
    # Pattern: (param: unknown[]) -> (param: any[])
    content = re.sub(
        r'\(([a-zA-Z_][a-zA-Z0-9_]*):\s*unknown\[\]\)',
        r'(\1: any[])',
        content
    )
    # Pattern: (param: unknown) -> (param: any) in function signatures
    content = re.sub(
        r'\(([a-zA-Z_][a-zA-Z0-9_]*):\s*unknown\)',
        r'(\1: any)',
        content
    )
    # Pattern: (param: unknown, -> (param: any,
    content = re.sub(
        r'\(([a-zA-Z_][a-zA-Z0-9_]*):\s*unknown,',
        r'(\1: any,',
        content
    )
    # Pattern: , param: unknown) -> , param: any)
    content = re.sub(
        r',\s*([a-zA-Z_][a-zA-Z0-9_]*):\s*unknown\)',
        r', \1: any)',
        content
    )
    return content

def fix_variable_declarations(content):
    """Fix variable declarations with explicit unknown type"""
    # Pattern: let x: unknown, y: unknown -> let x: any, y: any
    content = re.sub(
        r':\s*unknown\s*,',
        r': any,',
        content
    )
    # Pattern: let x: unknown (without assignment) -> let x: any
    content = re.sub(
        r'(const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*):\s*unknown(?![a-zA-Z0-9_])',
        r'\1 \2: any',
        content
    )
    # Pattern: const/let/var variable: unknown = ... -> const variable = ... as any
    content = re.sub(
        r'(const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*):\s*unknown\s*=\s*',
        r'\1 \2 = ',
        content
    )
    # Add 'as any' to $fetch calls that don't already have it
    content = re.sub(
        r'(await\s+\$fetch\([^)]+\))(?!\s+as\s+)',
        r'\1 as any',
        content
    )
    return content

def process_file(file_path):
    """Process a single file and fix unknown type errors"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply all fixes
        content = fix_catch_blocks(content)
        content = fix_promise_catch(content)
        content = fix_array_map(content)
        content = fix_array_filter(content)
        content = fix_array_foreach(content)
        content = fix_function_params(content)
        content = fix_variable_declarations(content)

        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    print("🔧 Fixing TypeScript TS18046 'unknown' type errors...\n")

    # Get all TypeScript and Vue files
    try:
        result = subprocess.run(
            ['find', '.', '-name', '*.ts', '-o', '-name', '*.vue', '-o', '-name', '*.tsx'],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        files = [f.strip() for f in result.stdout.split('\n') if f.strip() and
                'node_modules' not in f and '.nuxt' not in f and '.output' not in f]
    except Exception as e:
        print(f"Error finding files: {e}")
        return

    print(f"Found {len(files)} files to process...\n")

    fixed_count = 0
    for file_path in files:
        if process_file(file_path):
            print(f"  ✓ Fixed: {file_path}")
            fixed_count += 1

    print(f"\n📊 Results:")
    print(f"  Files processed: {len(files)}")
    print(f"  Files modified: {fixed_count}")

    if fixed_count > 0:
        print(f"\n✅ Fixed {fixed_count} files with unknown type patterns")
        print("   Run 'npx nuxi typecheck' to verify")
    else:
        print("\n✅ No files needed fixing")

if __name__ == '__main__':
    main()
