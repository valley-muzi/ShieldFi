INSERT INTO product
  (product_name, tier, product_description, coverage_amount_min, coverage_amount_max, premium_rate)
VALUES
  ('Basic Shield','BASIC','기본 보호 보험 상품으로 소액 손실 보장',         1000000000000000000,    10000000000000000000,   100000000000000000),
  ('Premium Shield','PREMIUM','중간 규모 손실 보장',                       10000000000000000000,   100000000000000000000,  1000000000000000000),
  ('Ultimate Shield','ULTIMATE','대규모 손실 보장',                        100000000000000000000,  1000000000000000000000, 10000000000000000000)
ON CONFLICT (product_name) DO NOTHING;
