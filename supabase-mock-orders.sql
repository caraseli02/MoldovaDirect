-- Mock Orders Data for Testing Order History Feature
-- This script creates realistic test orders with tracking, returns, and support tickets

-- =============================================
-- STEP 1: Get your user_id first
-- =============================================
-- Run this query first to get your user ID:
-- SELECT id, email FROM auth.users LIMIT 5;
-- Then replace 'YOUR_USER_ID_HERE' below with your actual UUID

-- =============================================
-- CONFIGURATION - UPDATE THIS!
-- =============================================
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE WITH YOUR USER ID
  v_order_id_1 INTEGER;
  v_order_id_2 INTEGER;
  v_order_id_3 INTEGER;
  v_order_id_4 INTEGER;
  v_order_id_5 INTEGER;
  v_product_id_1 INTEGER;
  v_product_id_2 INTEGER;
  v_product_id_3 INTEGER;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'User ID % does not exist. Please update v_user_id with a valid user ID.', v_user_id;
  END IF;

  -- Get some product IDs (or use any existing products)
  SELECT id INTO v_product_id_1 FROM products WHERE is_active = true LIMIT 1 OFFSET 0;
  SELECT id INTO v_product_id_2 FROM products WHERE is_active = true LIMIT 1 OFFSET 1;
  SELECT id INTO v_product_id_3 FROM products WHERE is_active = true LIMIT 1 OFFSET 2;

  IF v_product_id_1 IS NULL THEN
    RAISE EXCEPTION 'No products found. Please add products first.';
  END IF;

  RAISE NOTICE 'Creating mock orders for user: %', v_user_id;
  RAISE NOTICE 'Using products: %, %, %', v_product_id_1, v_product_id_2, v_product_id_3;

  -- =============================================
  -- ORDER 1: Delivered Order (with tracking history)
  -- =============================================
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    payment_intent_id,
    subtotal_eur,
    shipping_cost_eur,
    tax_eur,
    total_eur,
    shipping_address,
    billing_address,
    customer_notes,
    tracking_number,
    carrier,
    estimated_delivery,
    shipped_at,
    delivered_at,
    created_at,
    updated_at
  ) VALUES (
    'MD-' || TO_CHAR(NOW() - INTERVAL '10 days', 'YYYYMMDD') || '-0001',
    v_user_id,
    'delivered',
    'stripe',
    'paid',
    'pi_test_delivered_001',
    89.97,
    5.99,
    9.50,
    105.46,
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    'Please ring the doorbell',
    'DHL1234567890ES',
    'DHL',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO v_order_id_1;

  -- Order items for Order 1
  INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
  SELECT 
    v_order_id_1,
    p.id,
    jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'nameTranslations', p.name_translations,
      'descriptionTranslations', p.description_translations,
      'images', p.images,
      'attributes', p.attributes
    ),
    2,
    29.99,
    59.98
  FROM products p WHERE p.id = v_product_id_1;

  INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
  SELECT 
    v_order_id_1,
    p.id,
    jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'nameTranslations', p.name_translations,
      'descriptionTranslations', p.description_translations,
      'images', p.images,
      'attributes', p.attributes
    ),
    1,
    29.99,
    29.99
  FROM products p WHERE p.id = v_product_id_2;

  -- Tracking events for Order 1
  INSERT INTO order_tracking_events (order_id, status, location, description, timestamp) VALUES
    (v_order_id_1, 'label_created', 'Madrid, Spain', 'Shipping label created', NOW() - INTERVAL '10 days'),
    (v_order_id_1, 'picked_up', 'Madrid Distribution Center', 'Package picked up by carrier', NOW() - INTERVAL '9 days'),
    (v_order_id_1, 'in_transit', 'Barcelona Hub', 'Package in transit', NOW() - INTERVAL '7 days'),
    (v_order_id_1, 'in_transit', 'Valencia Sorting Facility', 'Package sorted', NOW() - INTERVAL '5 days'),
    (v_order_id_1, 'out_for_delivery', 'Madrid Local Depot', 'Out for delivery', NOW() - INTERVAL '3 days' + INTERVAL '8 hours'),
    (v_order_id_1, 'delivered', 'Madrid, Spain', 'Package delivered successfully', NOW() - INTERVAL '3 days' + INTERVAL '14 hours');

  RAISE NOTICE 'Created Order 1 (Delivered): ID %', v_order_id_1;

  -- =============================================
  -- ORDER 2: In Transit Order (currently shipping)
  -- =============================================
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    payment_intent_id,
    subtotal_eur,
    shipping_cost_eur,
    tax_eur,
    total_eur,
    shipping_address,
    billing_address,
    tracking_number,
    carrier,
    estimated_delivery,
    shipped_at,
    created_at,
    updated_at
  ) VALUES (
    'MD-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-0002',
    v_user_id,
    'shipped',
    'paypal',
    'paid',
    'PAYPAL-TEST-002',
    149.99,
    7.99,
    15.80,
    173.78,
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    'UPS9876543210ES',
    'UPS',
    NOW() + INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO v_order_id_2;

  -- Order items for Order 2
  INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
  SELECT 
    v_order_id_2,
    p.id,
    jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'nameTranslations', p.name_translations,
      'descriptionTranslations', p.description_translations,
      'images', p.images,
      'attributes', p.attributes
    ),
    1,
    149.99,
    149.99
  FROM products p WHERE p.id = v_product_id_3;

  -- Tracking events for Order 2
  INSERT INTO order_tracking_events (order_id, status, location, description, timestamp) VALUES
    (v_order_id_2, 'label_created', 'Madrid, Spain', 'Shipping label created', NOW() - INTERVAL '3 days'),
    (v_order_id_2, 'picked_up', 'Madrid Warehouse', 'Package collected', NOW() - INTERVAL '2 days' + INTERVAL '6 hours'),
    (v_order_id_2, 'in_transit', 'Zaragoza Hub', 'In transit to destination', NOW() - INTERVAL '1 day' + INTERVAL '12 hours'),
    (v_order_id_2, 'in_transit', 'Barcelona Distribution Center', 'Package arrived at distribution center', NOW() - INTERVAL '8 hours');

  RAISE NOTICE 'Created Order 2 (In Transit): ID %', v_order_id_2;

  -- =============================================
  -- ORDER 3: Processing Order (payment confirmed, preparing shipment)
  -- =============================================
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    payment_intent_id,
    subtotal_eur,
    shipping_cost_eur,
    tax_eur,
    total_eur,
    shipping_address,
    billing_address,
    customer_notes,
    created_at,
    updated_at
  ) VALUES (
    'MD-' || TO_CHAR(NOW() - INTERVAL '1 day', 'YYYYMMDD') || '-0003',
    v_user_id,
    'processing',
    'stripe',
    'paid',
    'pi_test_processing_003',
    79.98,
    5.99,
    8.60,
    94.57,
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    'Gift wrap please',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO v_order_id_3;

  -- Order items for Order 3
  INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
  SELECT 
    v_order_id_3,
    p.id,
    jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'nameTranslations', p.name_translations,
      'descriptionTranslations', p.description_translations,
      'images', p.images,
      'attributes', p.attributes
    ),
    2,
    39.99,
    79.98
  FROM products p WHERE p.id = v_product_id_1;

  RAISE NOTICE 'Created Order 3 (Processing): ID %', v_order_id_3;

  -- =============================================
  -- ORDER 4: Pending Order (payment pending)
  -- =============================================
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    subtotal_eur,
    shipping_cost_eur,
    tax_eur,
    total_eur,
    shipping_address,
    billing_address,
    created_at,
    updated_at
  ) VALUES (
    'MD-' || TO_CHAR(NOW() - INTERVAL '2 hours', 'YYYYMMDD') || '-0004',
    v_user_id,
    'pending',
    'cod',
    'pending',
    59.99,
    5.99,
    6.60,
    72.58,
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ) RETURNING id INTO v_order_id_4;

  -- Order items for Order 4
  INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
  SELECT 
    v_order_id_4,
    p.id,
    jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'nameTranslations', p.name_translations,
      'descriptionTranslations', p.description_translations,
      'images', p.images,
      'attributes', p.attributes
    ),
    2,
    29.99,
    59.98
  FROM products p WHERE p.id = v_product_id_2;

  RAISE NOTICE 'Created Order 4 (Pending): ID %', v_order_id_4;

  -- =============================================
  -- ORDER 5: Old Delivered Order (for return testing)
  -- =============================================
  INSERT INTO orders (
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    payment_intent_id,
    subtotal_eur,
    shipping_cost_eur,
    tax_eur,
    total_eur,
    shipping_address,
    billing_address,
    tracking_number,
    carrier,
    shipped_at,
    delivered_at,
    created_at,
    updated_at
  ) VALUES (
    'MD-' || TO_CHAR(NOW() - INTERVAL '20 days', 'YYYYMMDD') || '-0005',
    v_user_id,
    'delivered',
    'stripe',
    'paid',
    'pi_test_old_005',
    199.99,
    9.99,
    21.00,
    230.98,
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    '{"firstName": "John", "lastName": "Doe", "street": "Calle Mayor 123", "city": "Madrid", "postalCode": "28013", "country": "ES", "phone": "+34 600 123 456"}',
    'FEDEX5555555555ES',
    'FedEx',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '15 days'
  ) RETURNING id INTO v_order_id_5;

  -- Order items for Order 5
  INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price_eur, total_eur)
  SELECT 
    v_order_id_5,
    p.id,
    jsonb_build_object(
      'id', p.id,
      'sku', p.sku,
      'nameTranslations', p.name_translations,
      'descriptionTranslations', p.description_translations,
      'images', p.images,
      'attributes', p.attributes
    ),
    1,
    199.99,
    199.99
  FROM products p WHERE p.id = v_product_id_3;

  -- Tracking events for Order 5
  INSERT INTO order_tracking_events (order_id, status, location, description, timestamp) VALUES
    (v_order_id_5, 'label_created', 'Madrid, Spain', 'Shipping label created', NOW() - INTERVAL '20 days'),
    (v_order_id_5, 'picked_up', 'Madrid Hub', 'Package picked up', NOW() - INTERVAL '18 days'),
    (v_order_id_5, 'in_transit', 'International Hub', 'In transit', NOW() - INTERVAL '17 days'),
    (v_order_id_5, 'delivered', 'Madrid, Spain', 'Delivered', NOW() - INTERVAL '15 days');

  RAISE NOTICE 'Created Order 5 (Old Delivered): ID %', v_order_id_5;

  -- =============================================
  -- BONUS: Create a return request for Order 5
  -- =============================================
  INSERT INTO order_returns (
    order_id,
    user_id,
    status,
    return_items,
    total_refund_amount,
    additional_notes,
    requested_at
  ) VALUES (
    v_order_id_5,
    v_user_id,
    'pending',
    jsonb_build_array(
      jsonb_build_object(
        'productId', v_product_id_3,
        'quantity', 1,
        'reason', 'Product not as described'
      )
    ),
    199.99,
    'The product color does not match the website photos',
    NOW() - INTERVAL '2 days'
  );

  RAISE NOTICE 'Created return request for Order 5';

  -- =============================================
  -- BONUS: Create a support ticket for Order 2
  -- =============================================
  INSERT INTO support_tickets (
    user_id,
    order_id,
    subject,
    category,
    priority,
    status,
    message,
    order_context,
    customer_name,
    customer_email,
    customer_phone
  ) VALUES (
    v_user_id,
    v_order_id_2,
    'Question about delivery time',
    'shipping',
    'medium',
    'open',
    'Hi, I need this order urgently. Can you expedite the shipping?',
    jsonb_build_object(
      'orderNumber', 'MD-' || TO_CHAR(NOW() - INTERVAL '3 days', 'YYYYMMDD') || '-0002',
      'trackingNumber', 'UPS9876543210ES'
    ),
    'John Doe',
    'john.doe@example.com',
    '+34 600 123 456'
  );

  RAISE NOTICE 'Created support ticket for Order 2';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUCCESS! Created 5 mock orders with:';
  RAISE NOTICE '- Order 1: Delivered (with full tracking)';
  RAISE NOTICE '- Order 2: In Transit (with tracking)';
  RAISE NOTICE '- Order 3: Processing';
  RAISE NOTICE '- Order 4: Pending Payment';
  RAISE NOTICE '- Order 5: Old Delivered (with return request)';
  RAISE NOTICE '========================================';

END $$;
