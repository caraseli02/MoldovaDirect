-- =============================================
-- EMAIL TEMPLATES SCHEMA
-- =============================================
-- This schema supports email template management and versioning
-- 
-- Requirements: 5.1, 5.5, 5.6

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
    'order_confirmation',
    'order_processing',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'order_issue'
  )),
  locale VARCHAR(10) NOT NULL CHECK (locale IN ('en', 'es', 'ro', 'ru')),
  translations JSONB NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preheader VARCHAR(500),
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_type, locale)
);

-- Create email_template_history table for version control
CREATE TABLE IF NOT EXISTS email_template_history (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES email_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  translations JSONB NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preheader VARCHAR(500),
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS email_templates_type_locale_idx ON email_templates(template_type, locale);
CREATE INDEX IF NOT EXISTS email_templates_is_active_idx ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS email_template_history_template_id_idx ON email_template_history(template_id);
CREATE INDEX IF NOT EXISTS email_template_history_archived_at_idx ON email_template_history(archived_at DESC);

-- Enable Row Level Security
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active templates
CREATE POLICY "Active templates are readable" ON email_templates
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can modify templates (handled via service role)
CREATE POLICY "Admins can modify templates" ON email_templates
  FOR ALL
  USING (true);

-- Policy: Only admins can access template history
CREATE POLICY "Admins can access template history" ON email_template_history
  FOR ALL
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER email_templates_updated_at_trigger
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- =============================================
-- SEED DEFAULT TEMPLATES
-- =============================================

-- Insert default English templates
INSERT INTO email_templates (template_type, locale, translations, subject, preheader, version)
VALUES 
  ('order_confirmation', 'en', '{
    "title": "Order Confirmation",
    "subject": "Order Confirmation #{orderNumber} - Moldova Direct",
    "preheader": "Thank you for your order #{orderNumber}",
    "greeting": "Hello {name},",
    "message": "Thank you for your order! We are processing it and will send you updates.",
    "orderNumber": "Order Number",
    "orderDate": "Order Date",
    "estimatedDelivery": "Estimated Delivery",
    "orderDetails": "Order Details",
    "product": "Product",
    "quantity": "Quantity",
    "price": "Price",
    "total": "Total",
    "subtotal": "Subtotal",
    "shipping": "Shipping",
    "tax": "Tax",
    "orderTotal": "Order Total",
    "shippingAddress": "Shipping Address",
    "paymentMethod": "Payment Method",
    "trackingInfo": "Tracking Information",
    "trackingNumber": "Tracking Number",
    "trackOrder": "Track Order",
    "thankYou": "Thank you for shopping with us!",
    "footer": "If you have any questions, please contact our customer service.",
    "signature": "Moldova Direct Team",
    "companyInfo": "© 2024 Moldova Direct. All rights reserved.",
    "paymentMethods": {
      "cash": "Cash on Delivery",
      "credit_card": "Credit Card",
      "paypal": "PayPal",
      "bank_transfer": "Bank Transfer"
    }
  }', 'Order Confirmation #{orderNumber} - Moldova Direct', 'Thank you for your order #{orderNumber}', 1)
ON CONFLICT (template_type, locale) DO NOTHING;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================
COMMENT ON TABLE email_templates IS 'Stores email template configurations for different types and locales';
COMMENT ON TABLE email_template_history IS 'Maintains version history of email templates for rollback capability';
COMMENT ON COLUMN email_templates.translations IS 'JSON object containing all translatable strings for the template';
COMMENT ON COLUMN email_templates.version IS 'Version number incremented on each update';
COMMENT ON COLUMN email_template_history.archived_by IS 'User who made the change that archived this version';
