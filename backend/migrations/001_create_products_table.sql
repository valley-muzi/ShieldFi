-- Migration: Create PRODUCT table
-- Description: Creates the PRODUCT table for storing insurance product information
-- Version: 1.0
-- Date: 2025-01-19

-- Create PRODUCT table
CREATE TABLE IF NOT EXISTS PRODUCT (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) UNIQUE NOT NULL,
    tier VARCHAR(50) UNIQUE NOT NULL,
    product_description TEXT,
    coverage_amount_min NUMERIC(38, 5) NOT NULL,
    coverage_amount_max NUMERIC(38, 5) NOT NULL,
    premium_rate BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_tier ON PRODUCT(tier);
CREATE INDEX IF NOT EXISTS idx_product_name ON PRODUCT(product_name);

-- Insert initial product data
INSERT INTO PRODUCT (product_name, tier, product_description, coverage_amount_min, coverage_amount_max, premium_rate) VALUES
('Basic Shield', 'BASIC', '기본 보호 보험 상품으로 소액 손실에 대한 보장을 제공합니다.', 1000000000000000000, 10000000000000000000, 100000000000000000),
('Premium Shield', 'PREMIUM', '프리미엄 보호 보험 상품으로 중간 규모 손실에 대한 보장을 제공합니다.', 10000000000000000000, 100000000000000000000, 1000000000000000000),
('Ultimate Shield', 'ULTIMATE', '최고급 보호 보험 상품으로 대규모 손실에 대한 보장을 제공합니다.', 100000000000000000000, 1000000000000000000000, 10000000000000000000)
ON CONFLICT (product_name) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE PRODUCT IS '보험 상품 정보를 저장하는 테이블';
COMMENT ON COLUMN PRODUCT.product_id IS '상품 고유 ID';
COMMENT ON COLUMN PRODUCT.product_name IS '상품명';
COMMENT ON COLUMN PRODUCT.tier IS '상품 등급 (BASIC, PREMIUM, ULTIMATE)';
COMMENT ON COLUMN PRODUCT.product_description IS '상품 설명';
COMMENT ON COLUMN PRODUCT.coverage_amount_min IS '최소 보장 금액 (Wei 단위)';
COMMENT ON COLUMN PRODUCT.coverage_amount_max IS '최대 보장 금액 (Wei 단위)';
COMMENT ON COLUMN PRODUCT.premium_rate IS '보험료율 (Wei 단위)';
COMMENT ON COLUMN PRODUCT.created_at IS '생성일시';
COMMENT ON COLUMN PRODUCT.updated_at IS '수정일시';
