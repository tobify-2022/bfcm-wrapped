# Data Portal MCP Test Plan - BFCM Wrapped

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

## Data Points to Test

### 1. Core Metrics
- **Current Query**: `getCoreMetrics()` - Uses `shopify-dw.money_products.order_transactions_payments_summary`
- **Metrics**: total_orders, total_gmv, aov
- **Test**: Account level + Each shop individually

### 2. Peak GMV
- **Current Query**: `getPeakGMV()` - Uses `shopify-dw.money_products.order_transactions_payments_summary`
- **Metrics**: peak_gmv_per_minute, peak_minute
- **Test**: Account level + Each shop individually

### 3. Top Products
- **Current Query**: `getTopProducts()` - Uses `shopify-dw.merchant_sales.line_items`
- **Metrics**: product_title, variant_title, units_sold, revenue
- **Test**: Account level + Each shop individually

### 4. Channel Performance
- **Current Query**: `getChannelPerformance()` - Uses `shopify-dw.merchant_sales.orders` (limited - only 'online')
- **Metrics**: channel_type, gmv_2025, orders_2025, gmv_2024, orders_2024, yoy_growth_pct
- **Test**: Account level + Each shop individually

### 5. Retail Metrics
- **Current Query**: `getRetailMetrics()` - DISABLED (location_name not available)
- **Metrics**: top_location, retail_gmv, retail_aov, retail_upt, retail_orders
- **Test**: Check if Data Portal MCP has better data sources

### 6. Conversion Metrics
- **Current Query**: `getConversionMetrics()` - ESTIMATED (no session data)
- **Metrics**: total_sessions, sessions_with_cart, sessions_with_checkout, cart_to_checkout_rate, mobile_sessions, desktop_sessions, conversion_rate
- **Test**: Check if Data Portal MCP has session/analytics data

### 7. Customer Insights
- **Current Query**: `getCustomerInsights()` - Uses `shopify-dw.merchant_sales.orders` (limited customer data)
- **Metrics**: top_customer_email, top_customer_name, top_customer_spend, top_customer_orders, new_customers, returning_customers
- **Test**: Account level + Each shop individually

### 8. Referrer Data
- **Current Query**: `getReferrerData()` - DISABLED (referring_site not available)
- **Metrics**: top_referrer, referrer_gmv, referrer_orders
- **Test**: Check if Data Portal MCP has referrer data

### 9. Discount Metrics
- **Current Query**: `getDiscountMetrics()` - Uses `shopify-dw.merchant_sales.orders`
- **Metrics**: total_discounted_sales, total_full_price_sales, discounted_sales_pct, full_price_sales_pct, total_discount_amount
- **Test**: Account level + Each shop individually

### 10. International Sales
- **Current Query**: `getInternationalSales()` - Uses `shopify-dw.merchant_sales.orders` (limited - no cross-border detection)
- **Metrics**: cross_border_gmv, cross_border_orders, cross_border_pct, top_countries
- **Test**: Account level + Each shop individually

### 11. Units Per Transaction
- **Current Query**: `getUnitsPerTransaction()` - Uses `shopify-dw.merchant_sales.line_items`
- **Metrics**: avg_units_per_transaction
- **Test**: Account level + Each shop individually

### 12. Shop Breakdown
- **Current Query**: `getShopBreakdown()` - Uses `shopify-dw.money_products.order_transactions_payments_summary` + `shopify-dw.merchant_sales.line_items`
- **Metrics**: shop_id, shop_name, total_orders, total_gmv, aov, units_per_transaction
- **Test**: Account level (all shops)

### 13. Shopify BFCM Stats
- **Current Query**: `getShopifyBFCMStats()` - DISABLED (requires platform-wide access)
- **Metrics**: total_gmv_processed, peak_gmv_per_minute, peak_minute, total_orders, total_shops
- **Test**: Check if Data Portal MCP has platform-wide stats

## Testing Approach

For each data point:
1. **Test Account Level**: Query all shops together (aggregated)
2. **Test Individual Shops**: Query each shop separately
3. **Compare Results**: Verify consistency between account-level and shop-level aggregations
4. **Document Findings**: Note any discrepancies, missing data, or better data sources found via Data Portal MCP

## Expected Outcomes

1. **Validation**: Confirm current queries work correctly
2. **Improvements**: Identify better data sources via Data Portal MCP
3. **Gaps**: Document data that's truly unavailable
4. **Recommendations**: Suggest query optimizations or alternative approaches

