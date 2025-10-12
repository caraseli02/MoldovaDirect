#!/bin/bash
# Test script for order creation with email confirmation

# Configuration
API_URL="http://localhost:3000/api/orders/create"
AUTH_TOKEN="your-auth-token-here" # Optional, for authenticated user test

echo "Testing Order Creation with Email Confirmation"
echo "=============================================="

# Test 1: Guest Checkout
echo -e "\n📧 Test 1: Guest Checkout Order"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": 1,
    "guestEmail": "test@example.com",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "street": "123 Main St",
      "city": "Madrid",
      "postalCode": "28001",
      "country": "Spain",
      "phone": "+34123456789"
    },
    "paymentMethod": "credit_card",
    "shippingMethod": {
      "id": "standard",
      "name": "Standard Shipping",
      "price": 5.99,
      "estimatedDays": 5
    }
  }' | jq '.'

echo -e "\n✅ Check your email at test@example.com for confirmation"
echo "✅ Check server logs for email sending status"

# Test 2: Authenticated User (if you have a token)
if [ "$AUTH_TOKEN" != "your-auth-token-here" ]; then
  echo -e "\n👤 Test 2: Authenticated User Order"
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "cartId": 2,
      "shippingAddress": {
        "firstName": "Jane",
        "lastName": "Smith",
        "street": "456 Oak Ave",
        "city": "Barcelona",
        "postalCode": "08001",
        "country": "Spain",
        "phone": "+34987654321"
      },
      "paymentMethod": "paypal"
    }' | jq '.'
  
  echo -e "\n✅ Check user's registered email for confirmation"
fi

echo -e "\n📊 Next Steps:"
echo "1. Check server console logs for email sending status"
echo "2. Check email inbox for confirmation email"
echo "3. Query email_logs table to verify email was logged"
echo "4. Check email_delivery_attempts table for delivery status"
