# Data Portal MCP Test Results - BFCM Wrapped

## Test Account: LSKD
- **Account ID**: `0018V00002czC26QAE`
- **Primary Shop**: `9932004` (LSKD)
- **Expansion Shops**:
  - `24201560160` (LSKD US)
  - `85888139554` (LSKD Wholesale)
  - `75328487699` (LSKD NZ)
  - `93898178848` (LSKD Singapore POS)

## Test Date Range: BFCM 2024 (Nov 28 - Dec 1, 2024)
- **Start Date**: `2024-11-28`
- **End Date**: `2024-12-01`

---

## Test Results Summary

### ✅ Test 1: Core Metrics (Account Level - All Shops)
**Status**: ✅ PASSED
**Query**: Uses `shopify-dw.money_products.order_transactions_payments_summary`
**Results**:
- Total Orders: 48,381
- Total GMV: $4,821,684.17
- AOV: $99.61

**Findings**:
- Query works correctly with partition filter (`_extracted_at`)
- Current implementation is correct
- **Recommendation**: Add partition filter to improve performance

---

## Schema Analysis

### `shopify-dw.money_products.order_transactions_payments_summary`
**Key Fields Available**:
- ✅ `shop_id` (INTEGER)
- ✅ `order_id` (INTEGER)
- ✅ `amount_presentment` (NUMERIC) - Use for GMV
- ✅ `order_transaction_processed_at` (TIMESTAMP) - Use for date filtering
- ✅ `order_transaction_kind` (STRING) - Filter for 'capture'
- ✅ `order_transaction_status` (STRING) - Filter for 'success'
- ✅ `is_test` (BOOLEAN) - Filter out test orders
- ✅ `_extracted_at` (TIMESTAMP) - **REQUIRED for partition filtering**
- ✅ `api_client_type` (STRING) - Can identify 'Retail' vs 'Online'
- ✅ `is_pos` (BOOLEAN) - Can identify POS transactions
- ✅ `location_id` (INTEGER) - Available for retail location analysis
- ✅ `card_source` (STRING) - Available for payment method analysis

**Key Insights**:
1. **Channel Detection**: Can use `api_client_type` ('Retail' vs 'Online') instead of `sales_channel`
2. **POS Detection**: Can use `is_pos` flag for POS transactions
3. **Location Data**: `location_id` is available (can join to locations table for names)
4. **Partition Filter**: Must include `_extracted_at >= <date>` for performance

### `shopify-dw.merchant_sales.orders`
**Key Fields Available**:
- ✅ `shop_id` (INTEGER)
- ✅ `order_id` (INTEGER)
- ✅ `customer_id` (INTEGER)
- ✅ `created_at` (TIMESTAMP)
- ✅ `location_id` (INTEGER) - Available!
- ✅ `channel_id` (INTEGER) - Available!
- ✅ `billing_address_id` (INTEGER) - Can join to addresses for country
- ✅ `shipping_address_id` (INTEGER) - Can join to addresses for country
- ✅ `is_test` (BOOLEAN)
- ✅ `is_deleted` (BOOLEAN)
- ✅ `is_cancelled` (BOOLEAN)
- ✅ `currency_code` (STRING)
- ✅ `financial_status` (STRING)
- ✅ `fulfillment_status` (STRING)

**Key Insights**:
1. **Location ID**: Available! Can join to locations table for location names
2. **Channel ID**: Available! Can join to channels table for channel names
3. **Country Data**: Can join to addresses table via `billing_address_id` or `shipping_address_id`
4. **Customer Data**: `customer_id` available (can join to customers table)

### `shopify-dw.merchant_sales.line_items`
**Key Fields Available**:
- ✅ `line_item_id` (INTEGER)
- ✅ `order_id` (INTEGER)
- ✅ `shop_id` (INTEGER)
- ✅ `product_id` (INTEGER)
- ✅ `variant_id` (INTEGER)
- ✅ `product_title` (STRING)
- ✅ `variant_title` (STRING)
- ✅ `quantity` (INTEGER)
- ✅ `price_local` (NUMERIC) - Use for revenue
- ✅ `compare_at_price_local` (NUMERIC) - Can calculate discounts
- ✅ `origin_location_id` (INTEGER) - Available for fulfillment location
- ✅ `destination_location_id` (INTEGER) - Available for shipping location

**Key Insights**:
1. **Discount Detection**: Can use `compare_at_price_local` vs `price_local` to detect discounts
2. **Location Data**: `origin_location_id` and `destination_location_id` available
3. **Product Data**: All product fields available

---

## Recommendations Based on Schema Analysis

### 1. Channel Performance - IMPROVED APPROACH
**Current**: Uses `sales_channel` (not available) - defaults to 'online'
**Better**: Use `api_client_type` from `order_transactions_payments_summary`
```sql
-- Better channel detection
CASE 
  WHEN otps.api_client_type = 'Retail' THEN 'pos'
  WHEN otps.is_pos = TRUE THEN 'pos'
  ELSE 'online'
END as channel_type
```

### 2. Retail Metrics - NOW POSSIBLE
**Current**: Disabled (location_name not available)
**Better**: Join `orders.location_id` to `locations` table for location names
```sql
-- Can now get retail location names
SELECT 
  l.name as location_name,
  COUNT(DISTINCT o.order_id) as retail_orders,
  SUM(otps.amount_presentment) as retail_gmv
FROM `shopify-dw.merchant_sales.orders` o
INNER JOIN `shopify-dw.money_products.order_transactions_payments_summary` otps
  ON o.order_id = otps.order_id
LEFT JOIN `shopify-dw.accounts_and_administration.locations` l
  ON o.location_id = l.location_id
WHERE o.shop_id IN (...)
  AND otps.is_pos = TRUE
GROUP BY l.name
```

### 3. Discount Metrics - IMPROVED APPROACH
**Current**: Uses `total_discounts` and `discount_codes` from orders
**Better**: Use `compare_at_price_local` from line_items for more accurate discount detection
```sql
-- Better discount detection
SELECT 
  SUM(CASE 
    WHEN li.compare_at_price_local IS NOT NULL 
      AND li.compare_at_price_local > 0 
      AND li.price_local < li.compare_at_price_local 
    THEN li.price_local * li.quantity 
    ELSE 0 
  END) as total_discounted_sales,
  SUM(CASE 
    WHEN li.compare_at_price_local IS NULL 
      OR li.compare_at_price_local = 0 
      OR li.price_local >= li.compare_at_price_local 
    THEN li.price_local * li.quantity 
    ELSE 0 
  END) as total_full_price_sales
FROM `shopify-dw.merchant_sales.line_items` li
```

### 4. International Sales - NOW POSSIBLE
**Current**: Limited (no shop base country)
**Better**: Join to addresses table for billing/shipping country
```sql
-- Can now detect cross-border sales
SELECT 
  ba.country_code as billing_country,
  sa.country_code as shipping_country,
  COUNT(DISTINCT o.order_id) as orders,
  SUM(otps.amount_presentment) as gmv
FROM `shopify-dw.merchant_sales.orders` o
INNER JOIN `shopify-dw.money_products.order_transactions_payments_summary` otps
  ON o.order_id = otps.order_id
LEFT JOIN `shopify-dw.accounts_and_administration.addresses` ba
  ON o.billing_address_id = ba.address_id
LEFT JOIN `shopify-dw.accounts_and_administration.addresses` sa
  ON o.shipping_address_id = sa.address_id
WHERE o.shop_id IN (...)
GROUP BY ba.country_code, sa.country_code
```

### 5. Customer Insights - IMPROVED APPROACH
**Current**: Limited customer data (email, name not available)
**Better**: Join to customers table for full customer details
```sql
-- Can now get customer email and name
SELECT 
  c.email as customer_email,
  CONCAT(c.first_name, ' ', c.last_name) as customer_name,
  COUNT(DISTINCT o.order_id) as order_count,
  SUM(otps.amount_presentment) as total_spend
FROM `shopify-dw.merchant_sales.orders` o
INNER JOIN `shopify-dw.money_products.order_transactions_payments_summary` otps
  ON o.order_id = otps.order_id
LEFT JOIN `shopify-dw.buyer_activity.customers` c
  ON o.customer_id = c.customer_id
WHERE o.shop_id IN (...)
GROUP BY c.email, c.first_name, c.last_name
```

---

## Next Steps

1. ✅ Test Core Metrics - COMPLETED
2. ⏳ Test Peak GMV
3. ⏳ Test Top Products
4. ⏳ Test Channel Performance (with improved approach)
5. ⏳ Test Retail Metrics (with location join)
6. ⏳ Test Conversion Metrics (check for session data)
7. ⏳ Test Customer Insights (with customer join)
8. ⏳ Test Referrer Data (check for referrer fields)
9. ⏳ Test Discount Metrics (with compare_at_price)
10. ⏳ Test International Sales (with address joins)
11. ⏳ Test Units Per Transaction
12. ⏳ Test Shop Breakdown
13. ⏳ Update all queries based on findings

---

## Critical Findings

1. **Partition Filter Required**: All queries using `order_transactions_payments_summary` must include `_extracted_at >= <date>` filter
2. **Channel Detection Available**: Use `api_client_type` or `is_pos` instead of `sales_channel`
3. **Location Data Available**: Can join to locations table via `location_id`
4. **Customer Data Available**: Can join to customers table via `customer_id`
5. **Country Data Available**: Can join to addresses table for billing/shipping country
6. **Discount Detection Improved**: Use `compare_at_price_local` from line_items

