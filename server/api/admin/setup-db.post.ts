import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

const createTablesSQL = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES categories(id),
  name_translations JSONB NOT NULL,
  description_translations JSONB,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES categories(id),
  name_translations JSONB NOT NULL,
  description_translations JSONB,
  price_eur DECIMAL(10,2) NOT NULL,
  compare_at_price_eur DECIMAL(10,2),
  weight_kg DECIMAL(8,3),
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  images JSONB,
  attributes JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories(sort_order);

-- Products indexes
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)

    // Check if this is a POST request
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }

    // Execute the SQL to create tables
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: createTablesSQL 
    })

    if (error) {
      // If the RPC function doesn't exist, try a different approach
      console.log('RPC function not available, trying direct SQL execution...')
      
      // Try to create tables one by one using individual queries
      const queries = [
        `CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          slug TEXT NOT NULL UNIQUE,
          parent_id INTEGER REFERENCES categories(id),
          name_translations JSONB NOT NULL,
          description_translations JSONB,
          image_url TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          sku TEXT NOT NULL UNIQUE,
          category_id INTEGER REFERENCES categories(id),
          name_translations JSONB NOT NULL,
          description_translations JSONB,
          price_eur DECIMAL(10,2) NOT NULL,
          compare_at_price_eur DECIMAL(10,2),
          weight_kg DECIMAL(8,3),
          stock_quantity INTEGER DEFAULT 0,
          low_stock_threshold INTEGER DEFAULT 5,
          images JSONB,
          attributes JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`
      ]

      const results = []
      for (const query of queries) {
        try {
          const result = await supabase.rpc('exec_sql', { sql_query: query })
          results.push({ query: query.substring(0, 50) + '...', success: !result.error, error: result.error })
        } catch (err) {
          results.push({ query: query.substring(0, 50) + '...', success: false, error: err.message })
        }
      }

      return {
        message: 'Database setup attempted with individual queries',
        results,
        note: 'You may need to run the schema manually in Supabase SQL Editor'
      }
    }

    return {
      message: 'Database tables created successfully',
      data
    }

  } catch (error) {
    console.error('Database setup error:', error)
    
    return {
      message: 'Database setup failed - please run schema manually',
      error: error.message,
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Copy and paste the contents of supabase/sql/supabase-schema.sql',
        '4. Click Run to execute the schema',
        '5. Then try the seed endpoint again'
      ]
    }
  }
})