-- AI Image Generation Infrastructure Setup
-- This migration adds storage buckets and policies for AI-generated product images

-- =============================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- =============================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Public read access for product images
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Authenticated users can upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = owner
);

-- Admin users can delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =============================================
-- AI IMAGE GENERATION LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS ai_image_logs (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  original_url TEXT,
  generated_url TEXT NOT NULL,
  ai_provider TEXT NOT NULL CHECK (ai_provider IN ('huggingface', 'replicate', 'openai', 'stability')),
  ai_model TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('background_removal', 'generation', 'enhancement', 'upscale')),
  processing_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on AI image logs
ALTER TABLE ai_image_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all AI image logs
CREATE POLICY "Admins can view AI image logs" ON ai_image_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert AI image logs
CREATE POLICY "Admins can insert AI image logs" ON ai_image_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_ai_image_logs_product_id ON ai_image_logs(product_id);
CREATE INDEX idx_ai_image_logs_created_at ON ai_image_logs(created_at DESC);
CREATE INDEX idx_ai_image_logs_status ON ai_image_logs(status);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to clean up old AI image logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_image_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_image_logs
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('completed', 'failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE ai_image_logs IS 'Tracks all AI image generation operations for products';
COMMENT ON COLUMN ai_image_logs.ai_provider IS 'AI service provider (huggingface, replicate, openai, stability)';
COMMENT ON COLUMN ai_image_logs.operation IS 'Type of AI operation performed';
COMMENT ON COLUMN ai_image_logs.processing_time_ms IS 'Time taken to process the image in milliseconds';
COMMENT ON COLUMN ai_image_logs.metadata IS 'Additional metadata about the AI operation (model parameters, prompts, etc.)';
