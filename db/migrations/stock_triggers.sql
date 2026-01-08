-- Function to update stock levels after purchase
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO stock_levels (product_id, total_purchased, total_sold, current_stock, last_purchase_date, updated_at)
  VALUES (NEW.product_id, NEW.quantity, 0, NEW.quantity, NEW.purchase_date, NOW())
  ON CONFLICT (product_id) DO UPDATE SET
    total_purchased = stock_levels.total_purchased + NEW.quantity,
    current_stock = stock_levels.current_stock + NEW.quantity,
    last_purchase_date = NEW.purchase_date,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock levels after sale
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  current_qty INTEGER;
BEGIN
  -- Check stock availability first
  SELECT current_stock INTO current_qty
  FROM stock_levels
  WHERE product_id = NEW.product_id
  FOR UPDATE; -- Lock the row
  
  IF current_qty IS NULL OR current_qty < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock.  Available: %, Requested: %', COALESCE(current_qty, 0), NEW.quantity;
  END IF;
  
  UPDATE stock_levels SET
    total_sold = total_sold + NEW.quantity,
    current_stock = current_stock - NEW.quantity,
    last_sale_date = NEW.sale_date,
    updated_at = NOW()
  WHERE product_id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_purchase_stock_update
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION update_stock_on_purchase();

CREATE TRIGGER trigger_sale_stock_update
BEFORE INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

-- Index for common queries
CREATE INDEX idx_stock_levels_low_stock ON stock_levels (current_stock)
WHERE current_stock > 0;

CREATE INDEX idx_purchases_date_range ON purchases (purchase_date DESC);
CREATE INDEX idx_sales_date_range ON sales (sale_date DESC);