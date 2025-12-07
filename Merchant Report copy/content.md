# BFCM Wrapped - Complete BigQuery Query Guide

## Executive Summary

This is the **definitive production guide** for BFCM Wrapped BigQuery queries. All queries have been tested against **Peppermayo** (Shop ID: 49878007976) using BFCM 2025 data (Nov 28 - Dec 1, 2025).

**Test Results Summary:**
- **Orders:** 8,738 | **GMV:** $1,129,513 | **AOV:** $129.26
- **Sessions:** 369,396 | **Conversion Rate:** 2.52%
- **Shop Pay Adoption:** 44.8% | **Mobile Traffic:** 63.6%
- **YoY Growth:** +923% vs BFCM 2024

---

## Table of Contents

1. [Core Metrics](#1-core-metrics)
2. [Peak Performance](#2-peak-gmv-per-minute)
3. [Channel Performance](#3-channel-performance)
4. [Product Performance](#4-product-performance)
5. [Most Purchased Together](#5-most-purchased-together-products)
6. [Customer Insights](#6-customer-insights--top-customers)
7. [Shop Pay Performance](#7-shop-pay-performance)
8. [Shop Pay Installments](#8-shop-pay-installments-performance)
9. [Checkout Conversion Funnel](#9-checkout-conversion-funnel)
10. [Payment Methods Breakdown](#10-payment-methods-breakdown)
11. [Device Performance](#11-device--platform-performance)
12. [Retail/POS Metrics](#12-retailpos-metrics)
13. [Discount Analysis](#13-discount-metrics)
14. [International Sales](#14-international-sales)
15. [Referrer Attribution](#15-referrer-attribution)
16. [Multi-Store Reporting](#16-multi-store-breakdown)

---

## 1. Core Metrics ✅

### Visualization
Hero metrics card - Total Orders, GMV, AOV

### Peppermayo Results
- **Total Orders:** 8,738
- **Total GMV:** $1,129,513.01
- **AOV:** $129.26

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

order_totals AS (
  SELECT 
    otps.order_id,
    SUM(otps.amount_local) as order_amount
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
  GROUP BY otps.order_id
)

SELECT 
  COUNT(DISTINCT order_id) as total_orders,
  COALESCE(SUM(order_amount), 0) as total_gmv,
  COALESCE(AVG(order_amount), 0) as aov
FROM order_totals
```

### TypeScript Interface

```typescript
export interface CoreMetrics {
  total_orders: number;
  total_gmv: number;
  aov: number;
}
```

### Data Source
`shopify-dw.money_products.order_transactions_payments_summary`

---

## 2. Peak GMV Per Minute ✅

### Visualization
Highlight card - Peak sales velocity

### Peppermayo Results
- **Peak GMV:** $2,097.14/minute
- **Peak Time:** Nov 30, 2025 02:14 UTC (~12:14 PM AEDT)

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

minute_aggregates AS (
  SELECT 
    TIMESTAMP_TRUNC(otps.order_transaction_processed_at, MINUTE) as minute,
    SUM(otps.amount_local) as gmv_per_minute
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
  GROUP BY minute
)

SELECT 
  MAX(gmv_per_minute) as peak_gmv_per_minute,
  CAST(ANY_VALUE(minute) as STRING) as peak_minute
FROM minute_aggregates
WHERE gmv_per_minute = (SELECT MAX(gmv_per_minute) FROM minute_aggregates)
```

### TypeScript Interface

```typescript
export interface PeakGMV {
  peak_gmv_per_minute: number;
  peak_minute: string;
}
```

---

## 3. Channel Performance ✅

### Visualization
Horizontal bar chart - Channel comparison with YoY growth

### Peppermayo Results
- **Online:** $1,129,513 (100%) | YoY: +923%
- **POS:** $0 (no retail)
- **B2B:** $0 (no B2B)

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

successful_orders_2025 AS (
  SELECT 
    otps.shop_id,
    otps.order_id,
    SUM(otps.amount_local) as order_amount,
    MAX(CASE 
      WHEN otps.api_client_type = 'Retail' THEN 'POS'
      WHEN otps.is_pos = TRUE THEN 'POS'
      WHEN otps.api_client_type = 'B2B' THEN 'B2B'
      WHEN otps.api_client_type = 'Shop' THEN 'Shop App'
      ELSE 'Online'
    END) as channel_type
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate2025} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate2025} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate2025}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
  GROUP BY otps.shop_id, otps.order_id
),

successful_orders_2024 AS (
  SELECT 
    otps.shop_id,
    otps.order_id,
    SUM(otps.amount_local) as order_amount,
    MAX(CASE 
      WHEN otps.api_client_type = 'Retail' THEN 'POS'
      WHEN otps.is_pos = TRUE THEN 'POS'
      WHEN otps.api_client_type = 'B2B' THEN 'B2B'
      WHEN otps.api_client_type = 'Shop' THEN 'Shop App'
      ELSE 'Online'
    END) as channel_type
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate2024} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate2024} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate2024}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
  GROUP BY otps.shop_id, otps.order_id
),

channel_performance_2025 AS (
  SELECT 
    channel_type,
    SUM(order_amount) as gmv_2025,
    COUNT(DISTINCT order_id) as orders_2025,
    AVG(order_amount) as aov_2025
  FROM successful_orders_2025
  GROUP BY channel_type
),

channel_performance_2024 AS (
  SELECT 
    channel_type,
    SUM(order_amount) as gmv_2024,
    COUNT(DISTINCT order_id) as orders_2024,
    AVG(order_amount) as aov_2024
  FROM successful_orders_2024
  GROUP BY channel_type
)

SELECT 
  COALESCE(cp2025.channel_type, cp2024.channel_type) as channel_type,
  COALESCE(cp2025.gmv_2025, 0) as gmv_2025,
  COALESCE(cp2025.orders_2025, 0) as orders_2025,
  COALESCE(cp2025.aov_2025, 0) as aov_2025,
  COALESCE(cp2024.gmv_2024, 0) as gmv_2024,
  COALESCE(cp2024.orders_2024, 0) as orders_2024,
  COALESCE(cp2024.aov_2024, 0) as aov_2024,
  SAFE_DIVIDE((COALESCE(cp2025.gmv_2025, 0) - COALESCE(cp2024.gmv_2024, 0)), NULLIF(COALESCE(cp2024.gmv_2024, 0), 0)) * 100 as yoy_gmv_growth_pct,
  SAFE_DIVIDE((COALESCE(cp2025.orders_2025, 0) - COALESCE(cp2024.orders_2024, 0)), NULLIF(COALESCE(cp2024.orders_2024, 0), 0)) * 100 as yoy_order_growth_pct
FROM channel_performance_2025 cp2025
FULL OUTER JOIN channel_performance_2024 cp2024 ON cp2025.channel_type = cp2024.channel_type
ORDER BY gmv_2025 DESC NULLS LAST
```

### TypeScript Interface

```typescript
export interface ChannelPerformance {
  channel_type: 'Online' | 'POS' | 'B2B' | 'Shop App';
  gmv_2025: number;
  orders_2025: number;
  aov_2025: number;
  gmv_2024: number;
  orders_2024: number;
  aov_2024: number;
  yoy_gmv_growth_pct: number;
  yoy_order_growth_pct: number;
}
```

---

## 4. Product Performance ✅

### Visualization
Table showing top 10 products with revenue, units, and variant breakdown

### Peppermayo Results (Top 3)
1. **Kia Low Rise Asymmetrical Midi Skirt - Laguna Print (AU 8):** 55 units, $3,848 revenue
2. **Vedetta Mini Dress - White (AU 8):** 40 units, $3,363 revenue
3. **Vedetta Mini Dress - White (AU 6):** 40 units, $3,363 revenue

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

successful_orders AS (
  SELECT DISTINCT
    otps.order_id
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
),

product_sales AS (
  SELECT 
    li.product_title,
    li.variant_title,
    ANY_VALUE(CAST(li.product_id AS STRING)) as product_id,
    ANY_VALUE(CAST(li.variant_id AS STRING)) as variant_id,
    SUM(li.quantity) as units_sold,
    SUM(li.price_local * li.quantity) as revenue,
    AVG(li.price_local) as avg_unit_price,
    COUNT(DISTINCT li.order_id) as order_count
  FROM `shopify-dw.merchant_sales.line_items` li
  INNER JOIN successful_orders so ON li.order_id = so.order_id
  WHERE li.shop_id IN (${shopIdList})
    AND li.product_title IS NOT NULL
    AND li.price_local IS NOT NULL
  GROUP BY li.product_title, li.variant_title
)

SELECT 
  product_title,
  variant_title,
  product_id,
  variant_id,
  units_sold,
  revenue,
  avg_unit_price,
  order_count,
  -- Revenue per order (shows bundling effectiveness)
  SAFE_DIVIDE(revenue, order_count) as revenue_per_order
FROM product_sales
WHERE revenue > 0
ORDER BY revenue DESC
LIMIT 10
```

### TypeScript Interface

```typescript
export interface ProductPerformance {
  product_title: string;
  variant_title: string;
  product_id?: string;
  variant_id?: string;
  units_sold: number;
  revenue: number;
  avg_unit_price: number;
  order_count: number;
  revenue_per_order: number;
}
```

### Data Source
`shopify-dw.merchant_sales.line_items`

---

## 5. Most Purchased Together Products ✅ NEW

### Visualization
Product affinity matrix or "Frequently Bought Together" card

### Peppermayo Results (Top 3 Pairs)
1. **Breanne Top - Black Polka Dot** + **Breanne Midi Skirt - Black Polka Dot:** 70 co-purchases
2. **Ravi One Shoulder Top - Aqua** + **Ravi Maxi Skirt - Aqua:** 33 co-purchases
3. **Breanne Top - White Polka Dot** + **Breanne Midi Skirt - White Polka Dot:** 25 co-purchases

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

successful_orders AS (
  SELECT DISTINCT
    otps.order_id
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
),

order_products AS (
  SELECT 
    li.order_id,
    li.product_title,
    li.product_id
  FROM `shopify-dw.merchant_sales.line_items` li
  INNER JOIN successful_orders so ON li.order_id = so.order_id
  WHERE li.shop_id IN (${shopIdList})
    AND li.product_title IS NOT NULL
    AND li.product_id IS NOT NULL
),

product_pairs AS (
  SELECT 
    op1.product_title as product_a,
    op2.product_title as product_b,
    CAST(op1.product_id AS STRING) as product_a_id,
    CAST(op2.product_id AS STRING) as product_b_id,
    COUNT(DISTINCT op1.order_id) as times_purchased_together,
    -- Calculate affinity score (how often they're bought together vs independently)
    COUNT(DISTINCT op1.order_id) as pair_frequency
  FROM order_products op1
  INNER JOIN order_products op2 
    ON op1.order_id = op2.order_id 
    AND op1.product_id < op2.product_id  -- Avoid duplicates (A,B) and (B,A)
  GROUP BY op1.product_title, op2.product_title, op1.product_id, op2.product_id
  HAVING times_purchased_together >= 3  -- Minimum threshold for relevance
)

SELECT 
  product_a,
  product_b,
  product_a_id,
  product_b_id,
  times_purchased_together
FROM product_pairs
ORDER BY times_purchased_together DESC
LIMIT 10
```

### TypeScript Interface

```typescript
export interface ProductPair {
  product_a: string;
  product_b: string;
  product_a_id: string;
  product_b_id: string;
  times_purchased_together: number;
}
```

### Use Cases
- **Bundling Recommendations:** Create product bundles based on affinity
- **Cross-sell Opportunities:** "Complete the look" suggestions
- **Inventory Planning:** Stock matching products together
- **Marketing:** Create matching product campaigns

### Peppermayo Insight
Matching sets (tops + skirts) dominate the affinity list. This suggests:
- Strong "outfit" mentality in customer shopping behavior
- Opportunity for pre-bundled "complete the look" offerings
- Marketing campaigns should showcase coordinated pieces

---

## 6. Customer Insights & Top Customers ✅

### Visualization
Customer breakdown card + Top 10 spenders table

### Peppermayo Results
- **New Customers:** 8,594 (98.7%)
- **Returning Customers:** 117 (1.3%)
- **Top Customer Spend:** $1,950.20 (1 order)

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

successful_orders AS (
  SELECT 
    otps.order_id,
    SUM(otps.amount_local) as order_amount
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
  GROUP BY otps.order_id
),

customer_orders AS (
  SELECT 
    o.customer_id,
    o.order_id,
    o.created_at,
    so.order_amount,
    ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.created_at ASC) = 1 as is_first_order
  FROM `shopify-dw.merchant_sales.orders` o
  INNER JOIN successful_orders so ON o.order_id = so.order_id
  WHERE o.shop_id IN (${shopIdList})
    AND o.customer_id IS NOT NULL
    AND NOT o.is_deleted
    AND NOT o.is_cancelled
    AND o.is_test = FALSE
),

customer_metrics AS (
  SELECT 
    customer_id,
    COUNT(DISTINCT order_id) as order_count,
    SUM(order_amount) as total_spend,
    AVG(order_amount) as avg_order_value,
    MIN(created_at) as first_order_date,
    MAX(created_at) as last_order_date,
    -- Customer segment
    CASE 
      WHEN COUNT(DISTINCT order_id) = 1 THEN 'One-time Buyer'
      WHEN COUNT(DISTINCT order_id) = 2 THEN 'Repeat Buyer'
      WHEN COUNT(DISTINCT order_id) >= 3 THEN 'VIP'
    END as customer_segment,
    -- Value tier
    CASE 
      WHEN SUM(order_amount) >= 500 THEN 'High Value'
      WHEN SUM(order_amount) >= 200 THEN 'Medium Value'
      ELSE 'Low Value'
    END as value_tier
  FROM customer_orders
  GROUP BY customer_id
),

customer_counts AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN is_first_order THEN customer_id END) as new_customers,
    COUNT(DISTINCT CASE WHEN NOT is_first_order THEN customer_id END) as returning_customers
  FROM customer_orders
),

top_customers AS (
  SELECT 
    customer_id,
    total_spend,
    order_count,
    avg_order_value,
    customer_segment,
    value_tier
  FROM customer_metrics
  ORDER BY total_spend DESC
  LIMIT 10
)

-- Part 1: Customer Counts
SELECT 
  'summary' as result_type,
  NULL as customer_id,
  CAST(new_customers AS FLOAT64) as new_customers,
  CAST(returning_customers AS FLOAT64) as returning_customers,
  CAST((new_customers + returning_customers) AS FLOAT64) as total_customers,
  NULL as total_spend,
  NULL as order_count,
  NULL as avg_order_value,
  NULL as customer_segment,
  NULL as value_tier
FROM customer_counts

UNION ALL

-- Part 2: Top Customers
SELECT 
  'top_customer' as result_type,
  CAST(customer_id AS STRING) as customer_id,
  NULL as new_customers,
  NULL as returning_customers,
  NULL as total_customers,
  total_spend,
  CAST(order_count AS FLOAT64) as order_count,
  avg_order_value,
  customer_segment,
  value_tier
FROM top_customers
ORDER BY result_type, total_spend DESC NULLS LAST
```

### TypeScript Interface

```typescript
export interface CustomerInsightsSummary {
  new_customers: number;
  returning_customers: number;
  total_customers: number;
}

export interface TopCustomer {
  customer_id: string;
  total_spend: number;
  order_count: number;
  avg_order_value: number;
  customer_segment: 'One-time Buyer' | 'Repeat Buyer' | 'VIP';
  value_tier: 'High Value' | 'Medium Value' | 'Low Value';
}

export interface CustomerInsights {
  summary: CustomerInsightsSummary;
  top_customers: TopCustomer[];
}
```

### Data Source
`shopify-dw.merchant_sales.orders`

---

## 7. Shop Pay Performance ✅

### Visualization
Two-column comparison: Shop Pay vs Other Payments

### Peppermayo Results
- **Shop Pay:** 3,916 orders (44.8%), $491K GMV, $125.43 AOV
- **Other Payments:** 4,822 orders (55.2%), $638K GMV, $132.87 AOV
- **AOV Impact:** -5.6% (Shop Pay AOV lower than baseline)

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

successful_orders AS (
  SELECT 
    otps.order_id,
    MAX(otps.card_wallet_type) as card_wallet_type,
    MAX(otps.is_shop_pay_installments) as is_shop_pay_installments,
    SUM(otps.amount_local) as order_amount
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE otps.shop_id IN (${shopIdList})
    AND otps.order_transaction_processed_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND otps.order_transaction_processed_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
    AND otps._extracted_at >= TIMESTAMP('${startDate}')
    AND otps.order_transaction_kind = 'capture'
    AND otps.order_transaction_status = 'success'
    AND NOT otps.is_test
  GROUP BY otps.order_id
),

shop_pay_metrics AS (
  SELECT 
    -- Shop Pay orders (excluding installments to avoid double-counting)
    COUNT(DISTINCT CASE 
      WHEN LOWER(card_wallet_type) = 'shopify_pay' 
        AND COALESCE(is_shop_pay_installments, FALSE) = FALSE
      THEN order_id 
    END) as shop_pay_orders,
    SUM(CASE 
      WHEN LOWER(card_wallet_type) = 'shopify_pay' 
        AND COALESCE(is_shop_pay_installments, FALSE) = FALSE
      THEN order_amount 
    END) as shop_pay_gmv,
    AVG(CASE 
      WHEN LOWER(card_wallet_type) = 'shopify_pay' 
        AND COALESCE(is_shop_pay_installments, FALSE) = FALSE
      THEN order_amount 
    END) as shop_pay_aov,
    
    -- Non-Shop Pay orders for comparison
    COUNT(DISTINCT CASE 
      WHEN LOWER(card_wallet_type) != 'shopify_pay' 
        OR card_wallet_type IS NULL
      THEN order_id 
    END) as non_shop_pay_orders,
    SUM(CASE 
      WHEN LOWER(card_wallet_type) != 'shopify_pay' 
        OR card_wallet_type IS NULL
      THEN order_amount 
    END) as non_shop_pay_gmv,
    AVG(CASE 
      WHEN LOWER(card_wallet_type) != 'shopify_pay' 
        OR card_wallet_type IS NULL
      THEN order_amount 
    END) as non_shop_pay_aov,
    
    -- Total metrics
    COUNT(DISTINCT order_id) as total_orders,
    SUM(order_amount) as total_gmv
  FROM successful_orders
)

SELECT 
  shop_pay_orders,
  shop_pay_gmv,
  shop_pay_aov,
  non_shop_pay_orders,
  non_shop_pay_gmv,
  non_shop_pay_aov,
  total_orders,
  total_gmv,
  -- Adoption rate
  SAFE_DIVIDE(shop_pay_orders, total_orders) * 100 as shop_pay_adoption_pct,
  -- GMV contribution
  SAFE_DIVIDE(shop_pay_gmv, total_gmv) * 100 as shop_pay_gmv_pct,
  -- AOV comparison (Shop Pay vs baseline)
  SAFE_DIVIDE((shop_pay_aov - non_shop_pay_aov), non_shop_pay_aov) * 100 as aov_lift_pct
FROM shop_pay_metrics
```

### TypeScript Interface

```typescript
export interface ShopPayPerformance {
  shop_pay_orders: number;
  shop_pay_gmv: number;
  shop_pay_aov: number;
  non_shop_pay_orders: number;
  non_shop_pay_gmv: number;
  non_shop_pay_aov: number;
  total_orders: number;
  total_gmv: number;
  shop_pay_adoption_pct: number;
  shop_pay_gmv_pct: number;
  aov_lift_pct: number;
}
```

### Data Source
`shopify-dw.money_products.order_transactions_payments_summary`

---

## 8. Shop Pay Installments Performance ✅

### Visualization
Nested breakdown within Shop Pay section

### Peppermayo Results
- **Installments Orders:** 0 (not enabled for this merchant)

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

successful_orders AS (
  SELECT 
    otps.order_id,
    MAX(otps.card_wallet_type) as card_wallet_type,
    MAX(otps.is_shop_pay_installments) as is_shop_pay_installments,
    MAX(otps.installments_provider_name) as installments_provider_name,
    SUM(otps.amount_local) as order_amount
  FROM `shopify-dw.money_products.order_transactions_payments_summary` otps
  CROSS JOIN (SELECT MIN(iana
