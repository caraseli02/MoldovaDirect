# Search Performance Verification Guide

This guide explains how to verify that the GIN indexes created in migration `20251104_add_product_search_indexes.sql` are being used effectively by PostgreSQL.

## Overview

The search performance optimization (Issue #88) moves product search from JavaScript filtering to PostgreSQL-indexed queries. To ensure the indexes are being used, you need to verify with `EXPLAIN ANALYZE`.

## Prerequisites

- Access to Supabase database (production or staging)
- Database connection via Supabase Studio SQL Editor or `psql`
- Indexes must be created (migration applied)

## Verification Steps

### 1. Check Indexes Exist

First, verify that the indexes were created successfully:

```sql
-- List all indexes on the products table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;
```

Expected indexes:
- `idx_products_name_translations_gin`
- `idx_products_description_translations_gin`
- `idx_products_sku_pattern`

### 2. Verify Index Usage for Name Search

Run EXPLAIN ANALYZE on a typical name search query:

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
WHERE name_translations->>'es' ILIKE '%vino%';
```

**What to look for:**
- ✅ **Good**: `Bitmap Index Scan` or `Index Scan` using `idx_products_name_translations_gin`
- ❌ **Bad**: `Seq Scan` (sequential scan = full table scan)

**Example good output:**
```
Bitmap Heap Scan on products
  Recheck Cond: ((name_translations ->> 'es') ~~* '%vino%')
  -> Bitmap Index Scan on idx_products_name_translations_gin
      Index Cond: ((name_translations ->> 'es') ~~* '%vino%')
Planning Time: 1.234 ms
Execution Time: 15.678 ms
```

**Example bad output:**
```
Seq Scan on products
  Filter: ((name_translations ->> 'es') ~~* '%vino%')
Planning Time: 0.123 ms
Execution Time: 1234.567 ms  <- Much slower!
```

### 3. Verify Index Usage for Description Search

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
WHERE description_translations->>'en' ILIKE '%organic%';
```

Should use `idx_products_description_translations_gin`.

### 4. Verify Index Usage for SKU Search

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
WHERE sku ILIKE '%ABC%';
```

Should use `idx_products_sku_pattern` with text_pattern_ops.

### 5. Verify Multi-Language OR Query

This simulates the actual query from our API endpoints:

```sql
EXPLAIN ANALYZE
SELECT *
FROM products
WHERE
  name_translations->>'es' ILIKE '%wine%' OR
  name_translations->>'en' ILIKE '%wine%' OR
  name_translations->>'ro' ILIKE '%wine%' OR
  name_translations->>'ru' ILIKE '%wine%' OR
  description_translations->>'es' ILIKE '%wine%' OR
  description_translations->>'en' ILIKE '%wine%' OR
  description_translations->>'ro' ILIKE '%wine%' OR
  description_translations->>'ru' ILIKE '%wine%' OR
  sku ILIKE '%wine%';
```

**What to look for:**
- Multiple `Bitmap Index Scan` operations
- OR conditions should be evaluated using indexes, not sequential scans
- Total execution time should be <100ms for 10,000+ products

### 6. Performance Benchmarking

Run the same query multiple times to get average performance:

```sql
-- Run 5 times and average the results
DO $$
DECLARE
  start_time timestamp;
  end_time timestamp;
  duration interval;
BEGIN
  FOR i IN 1..5 LOOP
    start_time := clock_timestamp();

    PERFORM *
    FROM products
    WHERE name_translations->>'es' ILIKE '%test%';

    end_time := clock_timestamp();
    duration := end_time - start_time;

    RAISE NOTICE 'Run %: % ms', i, EXTRACT(milliseconds FROM duration);
  END LOOP;
END $$;
```

## Understanding EXPLAIN ANALYZE Output

### Key Metrics

1. **Planning Time**: Time spent planning the query (should be <5ms)
2. **Execution Time**: Actual query execution time (target: <100ms)
3. **Rows**: Number of rows returned
4. **Cost**: PostgreSQL's internal cost estimate (lower is better)

### Scan Types (Best to Worst)

1. **Index Scan**: Direct index lookup (fastest for small result sets)
2. **Bitmap Index Scan**: Uses index to create bitmap, then scans heap (good for medium result sets)
3. **Index Only Scan**: All data from index, no heap access (fastest overall)
4. **Seq Scan**: Full table scan (slowest, what we're trying to avoid)

## Troubleshooting

### Index Not Being Used

If PostgreSQL chooses sequential scan over index scan:

1. **Check table statistics are up to date:**
   ```sql
   ANALYZE products;
   ```

2. **Check table size:**
   ```sql
   SELECT pg_size_pretty(pg_total_relation_size('products')) as total_size;
   ```

   Small tables (<1000 rows) may use Seq Scan because it's actually faster.

3. **Check index validity:**
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'products' AND indexname LIKE 'idx_products%';
   ```

4. **Force index usage (testing only):**
   ```sql
   SET enable_seqscan = OFF;
   EXPLAIN ANALYZE SELECT ...;
   SET enable_seqscan = ON;
   ```

### GIN Index Limitations

GIN indexes are optimized for:
- ✅ Containment queries (`@>`, `<@`, `?`, `?&`, `?|`)
- ⚠️  Extraction with equality (`->>` with `=`)
- ❌ **NOT optimized for**: Extraction with ILIKE (`->>` with `ILIKE`)

**Why our queries might not use GIN perfectly:**

We use `name_translations->>'es' ILIKE '%pattern%'`, which:
1. Extracts the `es` field from JSONB (uses `->>`)
2. Performs pattern matching with ILIKE

PostgreSQL **may or may not** use the GIN index for this. It depends on:
- Table statistics
- Result set size estimation
- PostgreSQL version
- Index maintenance state

### Alternative: Full-Text Search Indexes

If GIN indexes aren't effective for `->> ILIKE` queries, consider migrating to full-text search:

```sql
-- Add tsvector columns
ALTER TABLE products ADD COLUMN name_search tsvector;
ALTER TABLE products ADD COLUMN description_search tsvector;

-- Create GIN indexes on tsvector
CREATE INDEX idx_products_name_search ON products USING GIN(name_search);
CREATE INDEX idx_products_description_search ON products USING GIN(description_search);

-- Populate tsvector columns
UPDATE products SET name_search = to_tsvector('english',
  COALESCE(name_translations->>'en', '') || ' ' ||
  COALESCE(name_translations->>'es', '') || ' ' ||
  COALESCE(name_translations->>'ro', '') || ' ' ||
  COALESCE(name_translations->>'ru', '')
);

-- Use full-text search in queries
SELECT * FROM products WHERE name_search @@ to_tsquery('english', 'wine');
```

This is **much faster** for text search but requires more significant changes.

## Performance Targets

Based on Issue #88 requirements:

- ✅ **Target**: <100ms for searches on 10,000+ products
- ⚠️  **Acceptable**: 100-200ms (still much better than 5-10s)
- ❌ **Unacceptable**: >500ms (indicates index not being used)

## Monitoring in Production

### Option 1: Supabase Studio

1. Go to Supabase Studio → Database → Query Performance
2. Look for slow queries (>100ms)
3. Check if search queries appear frequently

### Option 2: pg_stat_statements

Enable and query `pg_stat_statements`:

```sql
-- Check if enabled
SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';

-- View top slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%products%'
  AND query LIKE '%ILIKE%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Next Steps

If indexes are not being used effectively:

1. **Short-term**: Current implementation still performs better than JavaScript filtering
2. **Medium-term**: Test with production data volume to confirm performance
3. **Long-term**: Consider full-text search migration if needed

## References

- [PostgreSQL EXPLAIN Documentation](https://www.postgresql.org/docs/current/sql-explain.html)
- [PostgreSQL GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/performance)
- Issue #88: Product Search Performance Optimization
