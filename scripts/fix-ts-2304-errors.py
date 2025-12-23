#!/usr/bin/env python3
"""
Fix TypeScript TS2304 errors: Cannot find name 'X'

Targets:
1. _props vs props naming mismatches
2. Missing SupabaseClient imports
3. Missing store imports (useToastStore, useCartStore)
4. Missing type imports (Translations, etc.)
"""

import subprocess
import re
import os

def fix_props_mismatch(content):
    """Fix _props defined but props referenced"""
    # If file has _props = defineProps but uses props elsewhere
    if 'const _props = defineProps' in content:
        # Replace props. with _props. (but not in the defineProps line)
        lines = content.split('\n')
        fixed_lines = []
        for line in lines:
            if 'const _props = defineProps' not in line:
                # Replace props. with _props. but be careful with words like "properties"
                line = re.sub(r'\bprops\.', r'_props.', line)
            fixed_lines.append(line)
        return '\n'.join(fixed_lines)
    return content

def add_supabase_import(content, file_path):
    """Add missing SupabaseClient import if needed"""
    if 'SupabaseClient' in content and "import type { SupabaseClient }" not in content:
        # Find the imports section
        lines = content.split('\n')
        insert_index = 0

        # Find where to insert (after first import or at top)
        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_index = i + 1
                break

        # Insert the import
        import_line = "import type { SupabaseClient } from '@supabase/supabase-js'"
        lines.insert(insert_index, import_line)
        return '\n'.join(lines)
    return content

def add_store_imports(content):
    """Add missing store imports"""
    imports_to_add = []

    if 'useToastStore()' in content and 'useToastStore' not in content[:content.find('useToastStore()')]:
        imports_to_add.append("import { useToastStore } from '~/stores/toast'")

    if 'useCartStore()' in content and 'useCartStore' not in content[:content.find('useCartStore()')]:
        imports_to_add.append("import { useCartStore } from '~/stores/cart'")

    if imports_to_add:
        lines = content.split('\n')
        insert_index = 0

        # Find where to insert
        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_index = i + 1
                break

        # Insert all needed imports
        for import_line in reversed(imports_to_add):
            lines.insert(insert_index, import_line)

        return '\n'.join(lines)
    return content

def add_type_imports(content):
    """Add missing type imports"""
    # Check for Translations type
    if re.search(r'\btranslations?:\s*Translations\b', content, re.IGNORECASE):
        if "import type { Translations }" not in content:
            lines = content.split('\n')
            insert_index = 0

            for i, line in enumerate(lines):
                if line.startswith('import '):
                    insert_index = i + 1
                    break

            lines.insert(insert_index, "import type { Translations } from '~/types/database'")
            return '\n'.join(lines)

    return content

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply all fixes
        content = fix_props_mismatch(content)
        content = add_supabase_import(content, file_path)
        content = add_store_imports(content)
        content = add_type_imports(content)

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
    print("🔧 Fixing TypeScript TS2304 'Cannot find name' errors...\n")

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
        print(f"\n✅ Fixed {fixed_count} files with TS2304 patterns")
        print("   Run 'npx nuxi typecheck' to verify")
    else:
        print("\n✅ No files needed fixing")

if __name__ == '__main__':
    main()
