#!/usr/bin/env python3
"""
Fix missing imports in TypeScript files
"""

import subprocess
import re
import os

def add_h3_event_import(content):
    """Add H3Event import from h3 if missing"""
    if 'H3Event' in content and "import type { H3Event }" not in content:
        lines = content.split('\n')
        insert_index = 0

        # Find where to insert (after first import or at top)
        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_index = i + 1
                break

        # Insert the import
        import_line = "import type { H3Event } from 'h3'"
        lines.insert(insert_index, import_line)
        return '\n'.join(lines)
    return content

def add_supabase_server_imports(content):
    """Add missing Supabase server imports"""
    imports_to_add = []

    if 'serverSupabaseClient' in content and "serverSupabaseClient" not in content[:200]:
        if "#supabase/server" not in content:
            imports_to_add.append("import { serverSupabaseClient } from '#supabase/server'")

    if 'serverSupabaseServiceRole' in content and "serverSupabaseServiceRole" not in content[:200]:
        if "#supabase/server" not in content:
            imports_to_add.append("import { serverSupabaseServiceRole } from '#supabase/server'")

    if imports_to_add:
        lines = content.split('\n')
        insert_index = 0

        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_index = i + 1
                break

        for import_line in reversed(imports_to_add):
            lines.insert(insert_index, import_line)

        return '\n'.join(lines)
    return content

def add_missing_type_imports(content, file_path):
    """Add missing type imports based on file path"""
    imports_to_add = []

    # Add Address type if needed
    if 'Address' in content and "import type" not in content[:content.find('Address')] or file_path.endswith('types/checkout.ts'):
        if "Address" in content and "type Address" not in content and "interface Address" not in content:
            if file_path.endswith('types/checkout.ts'):
                # Address is defined in another types file
                imports_to_add.append("import type { Address } from './database'")

    # Add User type
    if 'User' in content and "type User" not in content and "interface User" not in content:
        if 'server/api' in file_path:
            imports_to_add.append("import type { User } from '~/types/database'")

    if imports_to_add:
        lines = content.split('\n')
        insert_index = 0

        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_index = i + 1
                break

        for import_line in reversed(imports_to_add):
            if import_line not in content:
                lines.insert(insert_index, import_line)

        return '\n'.join(lines)
    return content

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Apply all fixes
        content = add_h3_event_import(content)
        content = add_supabase_server_imports(content)
        content = add_missing_type_imports(content, file_path)

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
    print("🔧 Fixing missing imports...\n")

    # Get all TypeScript files
    try:
        result = subprocess.run(
            ['find', '.', '-name', '*.ts', '-o', '-name', '*.vue'],
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
        print(f"\n✅ Fixed {fixed_count} files with missing imports")
        print("   Run 'npx nuxi typecheck' to verify")
    else:
        print("\n✅ No files needed fixing")

if __name__ == '__main__':
    main()
