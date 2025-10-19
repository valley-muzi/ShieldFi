ALTER TABLE product
  ALTER COLUMN coverage_amount_min TYPE NUMERIC(38,5) USING coverage_amount_min::numeric,
  ALTER COLUMN coverage_amount_max TYPE NUMERIC(38,5) USING coverage_amount_max::numeric,
  ALTER COLUMN premium_rate       TYPE NUMERIC(38,5) USING premium_rate::numeric;
