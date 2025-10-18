-- Migration: Create INSURANCE_POLICY table
-- Description: Creates the INSURANCE_POLICY table for storing on-chain indexed insurance policy data
-- Version: 1.0
-- Date: 2025-01-19

-- Create INSURANCE_POLICY table
CREATE TABLE IF NOT EXISTS INSURANCE_POLICY (
    policy_id SERIAL PRIMARY KEY,
    user_wallet_addr VARCHAR(42) NOT NULL,
    product_id INT NOT NULL REFERENCES PRODUCT(product_id) ON DELETE CASCADE,
    
    nft_contract_addr VARCHAR(42) NOT NULL,
    nft_token_id VARCHAR(255) NOT NULL,
    
    policy_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    policy_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    join_tx_hash VARCHAR(66) UNIQUE,
    issue_tx_hash VARCHAR(66) UNIQUE,
    
    premium_paid DECIMAL(20, 8) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_insurance_policy_user_wallet ON INSURANCE_POLICY(user_wallet_addr);
CREATE INDEX IF NOT EXISTS idx_insurance_policy_product_id ON INSURANCE_POLICY(product_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policy_nft_contract ON INSURANCE_POLICY(nft_contract_addr);
CREATE INDEX IF NOT EXISTS idx_insurance_policy_nft_token_id ON INSURANCE_POLICY(nft_token_id);
CREATE INDEX IF NOT EXISTS idx_insurance_policy_join_tx ON INSURANCE_POLICY(join_tx_hash);
CREATE INDEX IF NOT EXISTS idx_insurance_policy_issue_tx ON INSURANCE_POLICY(issue_tx_hash);
CREATE INDEX IF NOT EXISTS idx_insurance_policy_dates ON INSURANCE_POLICY(policy_start_date, policy_end_date);

-- Add comments to table and columns
COMMENT ON TABLE INSURANCE_POLICY IS '온체인 인덱싱된 보험 정책 정보를 저장하는 테이블';
COMMENT ON COLUMN INSURANCE_POLICY.policy_id IS '정책 고유 ID';
COMMENT ON COLUMN INSURANCE_POLICY.user_wallet_addr IS '사용자 지갑 주소';
COMMENT ON COLUMN INSURANCE_POLICY.product_id IS '가입한 상품 ID (PRODUCT 테이블 참조)';
COMMENT ON COLUMN INSURANCE_POLICY.nft_contract_addr IS '발급된 NFT 컨트랙트 주소';
COMMENT ON COLUMN INSURANCE_POLICY.nft_token_id IS '발급된 NFT 토큰 ID';
COMMENT ON COLUMN INSURANCE_POLICY.policy_start_date IS '보험 시작일';
COMMENT ON COLUMN INSURANCE_POLICY.policy_end_date IS '보험 종료일';
COMMENT ON COLUMN INSURANCE_POLICY.join_tx_hash IS '보험 상품 가입 트랜잭션 해시';
COMMENT ON COLUMN INSURANCE_POLICY.issue_tx_hash IS 'NFT 발급 트랜잭션 해시';
COMMENT ON COLUMN INSURANCE_POLICY.premium_paid IS '사용자가 납부한 실제 보험료 (Wei 단위)';
COMMENT ON COLUMN INSURANCE_POLICY.created_at IS '생성일시';
COMMENT ON COLUMN INSURANCE_POLICY.updated_at IS '수정일시';
