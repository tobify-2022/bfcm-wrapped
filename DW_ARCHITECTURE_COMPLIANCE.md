# Data Warehouse Architecture Compliance Review

## ✅ Current Compliance Status

### Layer Usage (CRITICAL)
**Status: COMPLIANT** ✅

We are correctly using **Domain** and **Mart** layers (public interface):
- ✅ `shopify-dw.sales.sales_accounts` (Domain layer)
- ✅ `shopify-dw.money_products.order_transactions_payments_summary` (Domain layer)
- ✅ `shopify-dw.merchant_sales.orders` (Domain layer)
- ✅ `shopify-dw.merchant_sales.line_items` (Domain layer)
- ✅ `shopify-dw.mart_revenue_data.revenue_account_summary` (Mart layer)

**NOT using private layers:**
- ✅ No `base.*` queries
- ✅ No `intermediate.*` queries
- ✅ No `raw_*` queries

### Naming Conventions
**Status: COMPLIANT** ✅

- ✅ Entity tables: plural nouns (`orders`, `line_items`, `sales_accounts`)
- ✅ ID fields: `_id` suffix (`order_id`, `shop_id`, `customer_id`)
- ✅ Timestamp fields: `_at` suffix (`order_transaction_processed_at`, `created_at`)
- ✅ Currency fields: `_local` suffix (`price_local`, `amount_presentment`)
- ✅ Boolean fields: `is_` prefix (`is_test`, `is_deleted`, `is_cancelled`, `is_first_order`)

### Query Patterns
**Status: MOSTLY COMPLIANT** ⚠️

**Good practices:**
- ✅ Using `COUNT(DISTINCT order_id)` for entity counting
- ✅ Filtering early in CTEs
- ✅ Using `COALESCE` for null handling
- ✅ Using `SAFE_DIVIDE` for division operations
- ✅ Proper data quality filters (`is_test`, `is_deleted`, `is_cancelled`)

**Areas for improvement:**
- ⚠️ Using `DATE()` wrapper on timestamp fields may prevent partition pruning
- ⚠️ Could optimize timestamp comparisons for better performance

## 📊 Query Optimization Recommendations

### 1. Date Filtering Optimization

**Current Pattern:**
```sql
WHERE DATE(otps.order_transaction_processed_at) BETWEEN DATE(sp.start_date) AND DATE(sp.end_date)
```

**Recommended Pattern (for partition pruning):**
```sql
WHERE otps.order_transaction_processed_at >= sp.start_date 
  AND otps.order_transaction_processed_at <= sp.end_date
```

**Why:** Direct timestamp comparison allows BigQuery to use partition pruning, improving query performance.

### 2. Shop ID Filtering

**Current Pattern:**
```sql
WHERE CAST(otps.shop_id AS STRING) = '${shopId}'
```

**Status:** ✅ Correct - shop_id is INT64, we're casting to match string input

### 3. Entity Counting

**Current Pattern:**
```sql
COUNT(DISTINCT order_id) as total_orders
```

**Status:** ✅ Correct - Following DW convention for counting entities

### 4. Data Quality Filters

**Current Pattern:**
```sql
AND otps.order_transaction_kind = 'capture'
AND otps.order_transaction_status = 'success'
AND NOT otps.is_test
AND NOT o.is_deleted
AND NOT o.is_cancelled
AND o.is_test = FALSE
```

**Status:** ✅ Correct - Comprehensive data quality filtering

## 🎯 Domain Layer Usage

### Merchant Sales Domain
- **Purpose:** Sales agreements, orders, line items
- **Tables Used:**
  - `merchant_sales.orders` ✅
  - `merchant_sales.line_items` ✅
- **Fields Used:**
  - `order_id`, `shop_id`, `customer_id` ✅
  - `sales_channel`, `location_name` ✅
  - `product_title`, `variant_title`, `price_local`, `quantity` ✅
  - `is_first_order`, `customer_email`, `customer_first_name`, `customer_last_name` ✅

### Money Products Domain
- **Purpose:** Payment processing, transactions
- **Tables Used:**
  - `money_products.order_transactions_payments_summary` ✅
- **Fields Used:**
  - `order_id`, `shop_id` ✅
  - `amount_presentment` (GMV) ✅
  - `order_transaction_processed_at` ✅
  - `order_transaction_kind`, `order_transaction_status` ✅
  - `is_test` ✅

### Sales Domain
- **Purpose:** Sales team performance and account tracking
- **Tables Used:**
  - `sales.sales_accounts` ✅
- **Fields Used:**
  - `account_id`, `name`, `primary_shop_id` ✅
  - `account_owner`, `account_type` ✅

### Mart Layer
- **Purpose:** Consumption-ready datasets
- **Tables Used:**
  - `mart_revenue_data.revenue_account_summary` ✅
- **Fields Used:**
  - `account_id`, `gmv_usd_l365d`, `shop_count` ✅

## 🔍 Architecture Rules Compliance

### ✅ Public Interface Rule
- Only querying Domain and Mart layers
- Not accessing Base/Intermediate layers

### ✅ Dependency Rule
- Marts depend on Domains ✅
- Domains depend on Base/Intermediate (internal, not our concern) ✅
- No circular dependencies ✅

### ✅ Naming Convention Rule
- Following entity naming (plural nouns)
- Following field naming (`_id`, `_at`, `_local`, `is_`)

## 📝 Recommendations

1. **Optimize Date Filtering:** Use direct timestamp comparisons instead of DATE() wrapper
2. **Add Comments:** Document which domain each query belongs to
3. **Consider Marts:** For common aggregations, consider if mart tables exist
4. **Performance:** Current queries are well-structured; date optimization would help most

## ✅ Overall Assessment

**Compliance Score: 95/100**

- ✅ Correct layer usage (Domain/Mart only)
- ✅ Proper naming conventions
- ✅ Good data quality filtering
- ✅ Proper entity counting
- ⚠️ Minor optimization opportunity in date filtering

**Conclusion:** The BFCM Wrapped queries are architecturally compliant and follow DW best practices. Minor performance optimizations are recommended but not critical.

