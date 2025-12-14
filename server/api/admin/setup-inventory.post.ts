/**
 * Setup Inventory Management Database Schema
 *
 * Requirements addressed:
 * - 2.6: Inventory movement tracking and reporting
 *
 * Creates:
 * - inventory_movements table for tracking stock changes
 * - Enhanced product schema for inventory management
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)

    // Create inventory_movements table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create inventory_movements table if it doesn't exist
        CREATE TABLE IF NOT EXISTS inventory_movements (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
          quantity INTEGER NOT NULL,
          quantity_before INTEGER NOT NULL,
          quantity_after INTEGER NOT NULL,
          reason VARCHAR(100),
          reference_id VARCHAR(100), -- order_id, adjustment_id, etc.
          performed_by UUID REFERENCES auth.users(id),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS inventory_movements_product_id_idx ON inventory_movements(product_id);
        CREATE INDEX IF NOT EXISTS inventory_movements_created_at_idx ON inventory_movements(created_at);
        CREATE INDEX IF NOT EXISTS inventory_movements_type_idx ON inventory_movements(movement_type);

        -- Enable RLS
        ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

        -- Create policy for admin access
        DROP POLICY IF EXISTS "Admin can manage inventory movements" ON inventory_movements;
        CREATE POLICY "Admin can manage inventory movements" ON inventory_movements
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.id IN (
                SELECT user_id FROM user_roles 
                WHERE role_id IN (
                  SELECT id FROM admin_roles WHERE name = 'admin'
                )
              )
            )
          );

        -- Add reorder_point column to products if it doesn't exist
        ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_info JSONB;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_notes TEXT;

        -- Create function to automatically log inventory changes
        CREATE OR REPLACE FUNCTION log_inventory_movement()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Only log if stock_quantity changed
          IF OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity THEN
            INSERT INTO inventory_movements (
              product_id,
              movement_type,
              quantity,
              quantity_before,
              quantity_after,
              reason,
              performed_by
            ) VALUES (
              NEW.id,
              CASE 
                WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'in'
                WHEN NEW.stock_quantity < OLD.stock_quantity THEN 'out'
                ELSE 'adjustment'
              END,
              ABS(NEW.stock_quantity - OLD.stock_quantity),
              OLD.stock_quantity,
              NEW.stock_quantity,
              'automatic_update',
              auth.uid()
            );
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Create trigger for automatic inventory logging
        DROP TRIGGER IF EXISTS products_inventory_log_trigger ON products;
        CREATE TRIGGER products_inventory_log_trigger
          AFTER UPDATE ON products
          FOR EACH ROW
          EXECUTE FUNCTION log_inventory_movement();
      `,
    })

    if (createTableError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create inventory tables',
        data: createTableError,
      })
    }

    return {
      success: true,
      message: 'Inventory management schema created successfully',
    }
  }
  catch (error: any) {
    console.error('Setup inventory error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to setup inventory management',
    })
  }
})
