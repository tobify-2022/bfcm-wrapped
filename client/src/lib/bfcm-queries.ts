/**
 * BFCM Wrapped - Comprehensive BigQuery Queries
 * All queries for generating full BFCM reports
 * Uses shopify-dw.money_products and merchant_sales tables (based on shop-dash patterns)
 */

import { quickAPI } from './quick-api';

// ============================================================================
// INTERFACES
// ============================================================================

export interface AccountMapping {
  account_id: string;
  account_name: string;
  primary_shop_id: string;
}

export interface CoreMetrics {
  total_orders: number;
  total_gmv: number;
  aov: number;
}

export interface PeakGMV {
  peak_gmv_per_minute: number;
  peak_minute: string;
}

export interface ProductPerformance {
  product_title: string;
  variant_title: string;
  units_sold: number;
  revenue: number;
  product_id?: string;
  variant_id?: string;
  image_url?: string;
}

export interface ChannelPerformance {
  channel_type: string;
  gmv_2025: number;
  orders_2025: number;
  gmv_2024: number;
  orders_2024: number;
  yoy_growth_pct: number;
}

export interface RetailMetrics {
  top_location: string | null;
  retail_gmv: number;
  retail_aov: number;
  retail_upt: number; // Units Per Transaction
  retail_orders: number;
}

export interface ConversionMetrics {
  total_sessions: number;
  sessions_with_cart: number;
  sessions_with_checkout: number;
  cart_to_checkout_rate: number; // Percentage
  mobile_sessions: number;
  desktop_sessions: number;
  conversion_rate: number; // Sessions to Orders
}

export interface CustomerInsights {
  top_customer_email: string | null;
  top_customer_name: string | null;
  top_customer_spend: number;
  top_customer_orders: number;
  new_customers: number;
  returning_customers: number;
}

export interface ReferrerData {
  top_referrer: string | null;
  referrer_gmv: number;
  referrer_orders: number;
}

export interface ShopifyBFCMStats {
  total_gmv_processed: number;
  peak_gmv_per_minute: number;
  peak_minute: string;
  total_orders: number;
  total_shops: number;
}

export interface ShopBreakdown {
  shop_id: string;
  shop_name: string | null;
  total_orders: number;
  total_gmv: number;
  aov: number;
  units_per_transaction: number;
}

export interface DiscountMetrics {
  total_discounted_sales: number;
  total_full_price_sales: number;
  discounted_sales_pct: number;
  full_price_sales_pct: number;
  total_discount_amount: number;
}

export interface InternationalSales {
  cross_border_gmv: number;
  cross_border_orders: number;
  cross_border_pct: number;
  top_countries: Array<{
    country: string;
    gmv: number;
    orders: number;
  }>;
}

export interface TrafficAnalysis {
  total_sessions: number;
  sessions_by_day: Array<{
    date: string;
    sessions: number;
  }>;
  sessions_by_hour: Array<{
    hour: number;
    sessions: number;
  }>;
  sessions_by_region: Array<{
    region: string;
    sessions: number;
  }>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely parse shop ID to integer for BigQuery queries
 * shop_id is INT64 in BigQuery tables
 */
function parseShopId(shopId: string): number {
  const parsed = parseInt(shopId, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid shop ID: ${shopId}. Shop ID must be numeric.`);
  }
  return parsed;
}

/**
 * Parse shop IDs (single or array) to array of integers and SQL IN clause
 * Returns both the array and the SQL-ready list for use in queries
 */
function parseShopIds(shopIds: string | string[]): { ids: number[]; sqlList: string } {
  const shopIdArray = Array.isArray(shopIds) ? shopIds : [shopIds];
  if (shopIdArray.length === 0) {
    throw new Error('At least one shop ID is required');
  }
  const ids = shopIdArray.map(id => parseShopId(id));
  return { ids, sqlList: ids.join(', ') };
}

/**
 * Diagnostic function to verify shop exists and has data
 * Returns diagnostic information about the shop
 */
export async function verifyShopData(shopId: string): Promise<{
  shopExists: boolean;
  totalOrdersEver: number;
  firstTransactionDate: string | null;
  lastTransactionDate: string | null;
  hasDataInLast30Days: boolean;
}> {
  const shopIdInt = parseShopId(shopId);
  
  const query = `
    SELECT 
      COUNT(DISTINCT order_id) as total_orders_ever,
      MIN(order_transaction_processed_at) as first_transaction_date,
      MAX(order_transaction_processed_at) as last_transaction_date,
      COUNT(DISTINCT CASE 
        WHEN order_transaction_processed_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        THEN order_id 
      END) as orders_last_30_days
    FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
    WHERE otps.shop_id = ${shopIdInt}
      AND otps.order_transaction_kind = 'capture'
      AND otps.order_transaction_status = 'success'
      AND NOT otps.is_test
    LIMIT 1
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    if (result.rows.length === 0) {
      return {
        shopExists: false,
        totalOrdersEver: 0,
        firstTransactionDate: null,
        lastTransactionDate: null,
        hasDataInLast30Days: false,
      };
    }
    
    const row = result.rows[0];
    return {
      shopExists: true,
      totalOrdersEver: Number(row.total_orders_ever || 0),
      firstTransactionDate: row.first_transaction_date ? String(row.first_transaction_date) : null,
      lastTransactionDate: row.last_transaction_date ? String(row.last_transaction_date) : null,
      hasDataInLast30Days: Number(row.orders_last_30_days || 0) > 0,
    };
  } catch (error) {
    console.error(`❌ Error verifying shop data for shop_id=${shopIdInt}:`, error);
    return {
      shopExists: false,
      totalOrdersEver: 0,
      firstTransactionDate: null,
      lastTransactionDate: null,
      hasDataInLast30Days: false,
    };
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get account and shop mapping from Salesforce Account ID
 */
export async function getAccountMapping(accountId: string): Promise<AccountMapping | null> {
  const query = `
    SELECT 
      sa.account_id,
      sa.name as account_name,
      sa.primary_shop_id
    FROM \`shopify-dw.sales.sales_accounts\` sa
    WHERE sa.account_id = '${accountId}'
      AND sa.account_type = 'Customer'
    LIMIT 1
  `;

  const result = await quickAPI.queryBigQuery(query);
  
  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    account_id: String(row.account_id || ''),
    account_name: String(row.account_name || ''),
    primary_shop_id: String(row.primary_shop_id || ''),
  };
}

/**
 * Get core BFCM metrics for a given period
 * Uses shopify-dw.money_products.order_transactions_payments_summary
 * Supports single shop or multiple shops (aggregates results)
 */
export async function getCoreMetrics(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<CoreMetrics> {
  const { ids: shopIdInts, sqlList: shopIdList } = parseShopIds(shopIds);
  const shopIdArray = Array.isArray(shopIds) ? shopIds : [shopIds];

  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    order_totals AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      -- shop_id is INT64 in BigQuery - compare directly (more efficient than casting)
      WHERE otps.shop_id IN (${shopIdList})
        -- Use direct timestamp comparison for partition pruning (DW best practice)
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        -- Partition filter for performance (required per Data Portal MCP findings)
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
  `;

  const shopIdDisplay = shopIdArray.length === 1 ? shopIdInts[0] : `${shopIdArray.length} shops`;
  console.log(`🔍 Querying core metrics for ${shopIdDisplay}, period=${startDate} to ${endDate}`);
  
  try {
    // Diagnostic query (only for single shop to avoid complexity)
    if (shopIdArray.length === 1) {
      const diagnosticQuery = `
        SELECT 
          COUNT(DISTINCT order_id) as total_orders_ever,
          MIN(order_transaction_processed_at) as first_transaction_date,
          MAX(order_transaction_processed_at) as last_transaction_date
        FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
        WHERE otps.shop_id = ${shopIdInts[0]}
          AND otps.order_transaction_kind = 'capture'
          AND otps.order_transaction_status = 'success'
          AND NOT otps.is_test
        LIMIT 1
      `;
      
      try {
        const diagnosticResult = await quickAPI.queryBigQuery(diagnosticQuery);
        if (diagnosticResult.rows.length > 0) {
          const diag = diagnosticResult.rows[0];
          const totalOrdersEver = Number(diag.total_orders_ever || 0);
          const firstTx = diag.first_transaction_date ? String(diag.first_transaction_date) : null;
          const lastTx = diag.last_transaction_date ? String(diag.last_transaction_date) : null;
          
          console.log(`🔍 Shop ${shopIdInts[0]} diagnostic:`, {
            total_orders_ever: totalOrdersEver,
            first_transaction: firstTx,
            last_transaction: lastTx,
          });
          
          if (totalOrdersEver === 0) {
            console.warn(`⚠️ Shop ${shopIdInts[0]} exists but has NO successful transactions ever`);
          } else {
            // Check if date range is reasonable
            const startDateObj = new Date(startDate);
            const today = new Date();
            
            if (startDateObj > today) {
              console.warn(`⚠️ WARNING: Start date ${startDate} is ${Math.ceil((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days in the future!`);
              console.warn(`⚠️ Use "Use BFCM 2024 dates" button to test with historical data.`);
            }
            
            if (lastTx && new Date(lastTx) < startDateObj) {
              console.warn(`⚠️ WARNING: Last transaction date (${lastTx}) is before the query start date (${startDate})`);
            }
          }
        } else {
          console.warn(`⚠️ Shop ${shopIdInts[0]} not found in transaction table - shop may not exist or have no successful transactions`);
        }
      } catch (diagError) {
        console.warn(`⚠️ Diagnostic query failed (non-critical):`, diagError);
      }
    }

  const result = await quickAPI.queryBigQuery(query);
  
  if (result.rows.length === 0) {
      console.warn(`⚠️ Query returned no rows for ${shopIdDisplay}`);
    return {
      total_orders: 0,
      total_gmv: 0,
      aov: 0,
    };
  }

  const row = result.rows[0];
    const metrics = {
    total_orders: Number(row.total_orders || 0),
    total_gmv: Number(row.total_gmv || 0),
    aov: Number(row.aov || 0),
    };
    
    console.log(`✅ Core metrics result:`, metrics);
    
    if (metrics.total_orders === 0 && metrics.total_gmv === 0) {
      console.warn(`⚠️ No data found for ${shopIdDisplay} in period ${startDate} to ${endDate}`);
      console.warn(`⚠️ Possible reasons:`);
      console.warn(`   1. Shop ID(s) may not exist or be incorrect`);
      console.warn(`   2. Date range ${startDate} to ${endDate} may not have any transactions`);
      console.warn(`   3. All transactions may be filtered out (test orders, failed payments, etc.)`);
      console.warn(`   4. Date range is in the future (check if ${startDate} is a future date)`);
      
      // Check if date is in the future
      const startDateObj = new Date(startDate);
      const today = new Date();
      if (startDateObj > today) {
        console.warn(`⚠️ WARNING: Start date ${startDate} is ${Math.ceil((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days in the future!`);
        console.warn(`⚠️ Use "Use BFCM 2024 dates" button to test with historical data.`);
      }
    }
    
    return metrics;
  } catch (error) {
    console.error(`❌ Error querying core metrics for ${shopIdDisplay}:`, error);
    throw error;
  }
}

// Export query builders for tooltip display
export function getCoreMetricsQuery(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): string {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  return `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    order_totals AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
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
  `.trim();
}

// Additional query builders for tooltip display (simplified versions)
export function getPeakGMVQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Peak GMV query - aggregates GMV per minute and finds maximum`;
}

export function getTopProductsQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Top Products query - aggregates product sales from line_items`;
}

export function getChannelPerformanceQuery(
  _shopIds: string | string[],
  _startDate2025: string,
  _endDate2025: string,
  _startDate2024: string,
  _endDate2024: string
): string {
  return `Channel Performance query - uses api_client_type and is_pos from order_transactions_payments_summary`;
}

export function getRetailMetricsQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Retail Metrics query - filters POS orders using is_pos and joins to locations table (handles NULLs for merchants without retail)`;
}

export function getCustomerInsightsQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Customer Insights query - joins to customers_history and customer_email_addresses_history for customer details`;
}

export function getDiscountMetricsQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Discount Metrics query - uses compare_at_price_local from line_items to detect discounts`;
}

export function getInternationalSalesQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `International Sales query - uses billing_country_code and shipping_country_code from orders table`;
}

export function getUnitsPerTransactionQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Units Per Transaction query - calculates average units per order from line_items`;
}

export function getShopBreakdownQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Shop Breakdown query - aggregates metrics per shop for multi-store reporting`;
}

export function getConversionMetricsQuery(
  _shopIds: string | string[],
  _startDate: string,
  _endDate: string
): string {
  return `Conversion Metrics query - order-based approximation (session data not available)`;
}

export function getReferrerDataQuery(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): string {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  return `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
      GROUP BY otps.order_id
    ),
    referrer_attribution AS (
      SELECT 
        ash.referring_channel,
        ash.referring_category,
        ash.referrer,
        ash.referrer_url,
        COUNT(DISTINCT ash.order_id) as orders,
        SUM(so.order_amount) as gmv
      FROM \`shopify-dw.buyer_activity.attributed_sessions_history\` ash
      INNER JOIN successful_orders so ON ash.order_id = so.order_id
      WHERE ash.is_current = TRUE
        AND ash.is_last = TRUE
        AND ash.session_timestamp >= TIMESTAMP('${startDate} 00:00:00')
        AND ash.session_timestamp <= TIMESTAMP('${endDate} 23:59:59')
      GROUP BY ash.referring_channel, ash.referring_category, ash.referrer, ash.referrer_url
    ),
    top_referrer_data AS (
      SELECT 
        COALESCE(
          CASE 
            WHEN referring_channel IS NOT NULL AND referring_category IS NOT NULL 
            THEN CONCAT(referring_channel, ' (', referring_category, ')')
            WHEN referring_channel IS NOT NULL 
            THEN referring_channel
            WHEN referrer_url IS NOT NULL 
            THEN referrer_url
            WHEN referrer IS NOT NULL 
            THEN referrer
            ELSE 'Direct'
          END,
          'Unknown'
        ) as top_referrer,
        SUM(gmv) as referrer_gmv,
        SUM(orders) as referrer_orders
      FROM referrer_attribution
      GROUP BY referring_channel, referring_category, referrer, referrer_url
      ORDER BY referrer_gmv DESC
      LIMIT 1
    )
    SELECT 
      COALESCE(trd.top_referrer, 'Unknown') as top_referrer,
      COALESCE(trd.referrer_gmv, 0) as referrer_gmv,
      COALESCE(trd.referrer_orders, 0) as referrer_orders
    FROM (SELECT 1 as dummy) d
    LEFT JOIN top_referrer_data trd ON 1=1
  `;
}

export function getShopifyBFCMStatsQuery(
  startDate: string,
  endDate: string
): string {
  const bfcm2025Start = '2025-11-28';
  const bfcm2025End = '2025-12-01';
  const isBFCM2025 = startDate === bfcm2025Start && endDate === bfcm2025End;
  
  if (isBFCM2025) {
    return `Official BFCM 2025 Platform Stats:
- Total GMV: $14.6 billion (27% YoY increase)
- Peak GMV per Minute: $5.1 million (at 12:01 PM EST on Nov 28, 2025)
- Consumers: 81+ million worldwide
- Merchants with Best Day Ever: 94,900+
- Average Cart: $114.70
- Cross-Border Orders: 16% of all orders
- Shop Pay: 32% of orders (39% YoY increase)
- Packages Tracked: 136M+ on Shop App

These are official Shopify platform-wide statistics for BFCM 2025.`;
  }
  
  return `Platform-wide stats only available for BFCM 2025 dates (Nov 28 - Dec 1, 2025)`;
}

/**
 * Get peak GMV per minute
 * Supports single shop or multiple shops (aggregates results)
 */
export async function getPeakGMV(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<PeakGMV | null> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    minute_aggregates AS (
      SELECT 
        TIMESTAMP_TRUNC(otps.order_transaction_processed_at, MINUTE) as minute,
        SUM(otps.amount_local) as gmv_per_minute
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      -- shop_id is INT64 in BigQuery - compare directly (more efficient than casting)
      WHERE otps.shop_id IN (${shopIdList})
        -- Use direct timestamp comparison for partition pruning (DW best practice)
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        -- Partition filter for performance (required per Data Portal MCP findings)
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
  `;

  const result = await quickAPI.queryBigQuery(query);
  
  if (result.rows.length === 0 || !result.rows[0].peak_gmv_per_minute) {
    return null;
  }

  const row = result.rows[0];
  return {
    peak_gmv_per_minute: Number(row.peak_gmv_per_minute || 0),
    peak_minute: String(row.peak_minute || ''),
  };
}

/**
 * Get top 10 products by revenue
 * Uses merchant_sales.line_items for product data
 * Supports single shop or multiple shops (aggregates results)
 * Based on shopify-dw.merchant_sales.line_items schema:
 * - Uses price_local (not price) for line item price
 * - product_title, variant_title, quantity are available
 */
export async function getTopProducts(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<ProductPerformance[]> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT DISTINCT
        otps.order_id
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      -- shop_id is INT64 in BigQuery - compare directly (more efficient than casting)
      WHERE otps.shop_id IN (${shopIdList})
        -- Use direct timestamp comparison for partition pruning (DW best practice)
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        -- Partition filter for performance (required per Data Portal MCP findings)
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
        ANY_VALUE(li.image_url) as image_url,
        SUM(li.quantity) as units_sold,
        -- Use price_local * quantity for revenue (as per data-warehouse patterns)
        SUM(li.price_local * li.quantity) as revenue
      FROM \`shopify-dw.merchant_sales.line_items\` li
      INNER JOIN successful_orders so ON li.order_id = so.order_id
      -- shop_id is INT64 in BigQuery - compare directly
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
      image_url,
      units_sold,
      revenue
    FROM product_sales
    WHERE revenue > 0
    ORDER BY revenue DESC
    LIMIT 10
  `;

  try {
  const result = await quickAPI.queryBigQuery(query);
  
  return result.rows.map((row) => ({
    product_title: String(row.product_title || 'Unknown Product'),
    variant_title: String(row.variant_title || ''),
    product_id: row.product_id ? String(row.product_id) : undefined,
    variant_id: row.variant_id ? String(row.variant_id) : undefined,
    image_url: row.image_url ? String(row.image_url) : undefined,
    units_sold: Number(row.units_sold || 0),
    revenue: Number(row.revenue || 0),
  }));
  } catch (error) {
    console.error('Error fetching top products:', error);
    console.warn('⚠️ Product-level data query failed');
    return [];
  }
}

/**
 * Get retail/POS metrics
 * Uses location_id from orders and is_pos from order_transactions_payments_summary
 * Handles merchants without retail locations gracefully (returns NULL/0 values)
 */
export async function getRetailMetrics(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<RetailMetrics> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount,
        MAX(otps.is_pos) as is_pos
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
        AND otps.is_pos = TRUE  -- Only POS/retail orders
      GROUP BY otps.order_id
    ),
    retail_orders_with_location AS (
      SELECT 
        o.order_id,
        o.location_id,
        so.order_amount,
        -- Get location name from logistics.locations_history (per Data Portal MCP findings)
        l.name as location_name
      FROM \`shopify-dw.merchant_sales.orders\` o
      INNER JOIN successful_orders so ON o.order_id = so.order_id
      LEFT JOIN \`shopify-dw.logistics.locations_history\` l
        ON o.location_id = l.location_id
        AND l.valid_to IS NULL  -- Get current location records only
      WHERE o.shop_id IN (${shopIdList})
        AND NOT o.is_deleted
        AND NOT o.is_cancelled
        AND o.is_test = FALSE
        AND o.location_id IS NOT NULL  -- Only orders with location (retail)
    ),
    location_metrics AS (
      SELECT 
        location_id,
        location_name,
        COUNT(DISTINCT order_id) as retail_orders,
        SUM(order_amount) as retail_gmv,
        AVG(order_amount) as retail_aov
      FROM retail_orders_with_location
      GROUP BY location_id, location_name
    ),
    location_units AS (
      SELECT 
        ro.location_id,
        SUM(li.quantity) as total_units,
        COUNT(DISTINCT ro.order_id) as order_count
      FROM retail_orders_with_location ro
      LEFT JOIN \`shopify-dw.merchant_sales.line_items\` li
        ON ro.order_id = li.order_id
        AND ro.location_id = li.origin_location_id  -- Use origin_location_id for fulfillment location
      GROUP BY ro.location_id
    ),
    top_location_data AS (
      SELECT 
        lm.location_id,
        lm.location_name,
        lm.retail_orders,
        lm.retail_gmv,
        lm.retail_aov,
        COALESCE(lu.total_units / NULLIF(lu.order_count, 0), 0) as retail_upt
      FROM location_metrics lm
      LEFT JOIN location_units lu ON lm.location_id = lu.location_id
      ORDER BY lm.retail_gmv DESC
      LIMIT 1
    ),
    totals AS (
      SELECT 
        COUNT(DISTINCT order_id) as total_retail_orders,
        SUM(order_amount) as total_retail_gmv,
        AVG(order_amount) as total_retail_aov
      FROM retail_orders_with_location
    ),
    total_units AS (
      SELECT 
        SUM(li.quantity) as total_units,
        COUNT(DISTINCT ro.order_id) as order_count
      FROM retail_orders_with_location ro
      LEFT JOIN \`shopify-dw.merchant_sales.line_items\` li
        ON ro.order_id = li.order_id
    )
    SELECT 
      COALESCE(tld.location_name, CONCAT('Location ', CAST(tld.location_id AS STRING))) as top_location,
      COALESCE(totals.total_retail_gmv, 0) as retail_gmv,
      COALESCE(totals.total_retail_aov, 0) as retail_aov,
      COALESCE(total_units.total_units / NULLIF(total_units.order_count, 0), 0) as retail_upt,
      COALESCE(totals.total_retail_orders, 0) as retail_orders
    FROM totals
    CROSS JOIN total_units
    LEFT JOIN top_location_data tld ON 1=1
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    
    if (result.rows.length === 0) {
      // No retail locations - return empty metrics (merchant may not have retail)
      return {
        top_location: null,
        retail_gmv: 0,
        retail_aov: 0,
        retail_upt: 0,
        retail_orders: 0,
      };
    }
    
    const row = result.rows[0];
    return {
      top_location: row.top_location ? String(row.top_location) : null,
      retail_gmv: Number(row.retail_gmv || 0),
      retail_aov: Number(row.retail_aov || 0),
      retail_upt: Number(row.retail_upt || 0),
      retail_orders: Number(row.retail_orders || 0),
    };
  } catch (error) {
    console.error('Error fetching retail metrics:', error);
    // Return empty if retail data not available (merchant may not have retail locations)
    return {
      top_location: null,
      retail_gmv: 0,
      retail_aov: 0,
      retail_upt: 0,
      retail_orders: 0,
    };
  }
}

// getConversionMetrics is implemented below with enhanced version using order data estimates

/**
 * Get customer insights
 * Uses merchant_sales.orders for customer data
 * Supports single shop or multiple shops (aggregates results)
 */
export async function getCustomerInsights(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<CustomerInsights> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      -- shop_id is INT64 in BigQuery - compare directly (more efficient than casting)
      WHERE otps.shop_id IN (${shopIdList})
        -- Use direct timestamp comparison for partition pruning (DW best practice)
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        -- Partition filter for performance (required per Data Portal MCP findings)
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id
    ),
    order_customer_data AS (
      SELECT 
        o.order_id,
        o.customer_id,
        o.created_at as order_created_at,
        so.order_amount,
        -- Get customer email from customer_email_addresses_history (field name is email_address, not email)
        cea.email_address as customer_email,
        -- Get customer name from customers_history
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        -- Determine first order using created_at timestamp (more accurate than order_id)
        ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.created_at ASC) = 1 as is_first_order
      FROM \`shopify-dw.merchant_sales.orders\` o
      INNER JOIN successful_orders so ON o.order_id = so.order_id
      -- Join to customers_history for name (current records only)
      LEFT JOIN \`shopify-dw.buyer_activity.customers_history\` c
        ON o.customer_id = c.customer_id
        AND c.is_current = TRUE
        AND c.valid_to IS NULL
      -- Join to customer_email_addresses_history for email (current records only)
      LEFT JOIN \`shopify-dw.buyer_activity.customer_email_addresses_history\` cea
        ON o.customer_id = cea.customer_id
        AND cea.is_current = TRUE
        AND cea.valid_to IS NULL
        AND NOT cea.is_deleted
        AND NOT cea.is_hard_deleted
        -- Get the most recent email if multiple exist
        QUALIFY ROW_NUMBER() OVER (PARTITION BY cea.customer_id ORDER BY cea.valid_from DESC) = 1
      -- shop_id is INT64 in BigQuery - compare directly
      WHERE o.shop_id IN (${shopIdList})
        AND NOT o.is_deleted
        AND NOT o.is_cancelled
        AND o.is_test = FALSE
    ),
    customer_totals AS (
      SELECT 
        customer_id,
        customer_email,
        CONCAT(COALESCE(customer_first_name, ''), ' ', COALESCE(customer_last_name, '')) as customer_name,
        SUM(order_amount) as total_spend,
        COUNT(DISTINCT order_id) as order_count
      FROM order_customer_data
      WHERE customer_id IS NOT NULL
      GROUP BY customer_id, customer_email, customer_first_name, customer_last_name
    ),
    top_customer AS (
      SELECT 
        customer_email,
        customer_name,
        total_spend,
        order_count
      FROM customer_totals
      ORDER BY total_spend DESC
      LIMIT 1
    ),
    customer_counts AS (
      SELECT 
        COUNT(DISTINCT CASE WHEN is_first_order THEN customer_id END) as new_customers,
        COUNT(DISTINCT CASE WHEN NOT is_first_order THEN customer_id END) as returning_customers
      FROM order_customer_data
      WHERE customer_id IS NOT NULL
    )
    SELECT 
      COALESCE(tc.customer_email, '') as top_customer_email,
      COALESCE(tc.customer_name, '') as top_customer_name,
      COALESCE(tc.total_spend, 0) as top_customer_spend,
      COALESCE(tc.order_count, 0) as top_customer_orders,
      COALESCE(cc.new_customers, 0) as new_customers,
      COALESCE(cc.returning_customers, 0) as returning_customers
    FROM customer_counts cc
    CROSS JOIN (SELECT 1 as dummy) d
    LEFT JOIN top_customer tc ON 1=1
  `;

  try {
    const result = await quickAPI.queryBigQuery(query);
    
    if (result.rows.length === 0) {
      return {
        top_customer_email: null,
        top_customer_name: null,
        top_customer_spend: 0,
        top_customer_orders: 0,
        new_customers: 0,
        returning_customers: 0,
      };
    }

    const row = result.rows[0];
    return {
      top_customer_email: row.top_customer_email ? String(row.top_customer_email) : null,
      top_customer_name: row.top_customer_name ? String(row.top_customer_name) : null,
      top_customer_spend: Number(row.top_customer_spend || 0),
      top_customer_orders: Number(row.top_customer_orders || 0),
      new_customers: Number(row.new_customers || 0),
      returning_customers: Number(row.returning_customers || 0),
    };
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    return {
      top_customer_email: null,
      top_customer_name: null,
      top_customer_spend: 0,
      top_customer_orders: 0,
      new_customers: 0,
      returning_customers: 0,
    };
  }
}

/**
 * Get referrer data
 * Uses shopify-dw.buyer_activity.attributed_sessions_history for referrer attribution
 * Supports single shop or multiple shops (aggregates results)
 */
export async function getReferrerData(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<{ data: ReferrerData; query: string }> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
      GROUP BY otps.order_id
    ),
    referrer_attribution AS (
      SELECT 
        ash.referring_channel,
        ash.referring_category,
        ash.referrer,
        ash.referrer_url,
        COUNT(DISTINCT ash.order_id) as orders,
        SUM(so.order_amount) as gmv
      FROM \`shopify-dw.buyer_activity.attributed_sessions_history\` ash
      INNER JOIN successful_orders so ON ash.order_id = so.order_id
      WHERE ash.is_current = TRUE
        AND ash.is_last = TRUE
        AND ash.session_timestamp >= TIMESTAMP('${startDate} 00:00:00')
        AND ash.session_timestamp <= TIMESTAMP('${endDate} 23:59:59')
      GROUP BY ash.referring_channel, ash.referring_category, ash.referrer, ash.referrer_url
    ),
    top_referrer_data AS (
      SELECT 
        COALESCE(
          CASE 
            WHEN referring_channel IS NOT NULL AND referring_category IS NOT NULL 
            THEN CONCAT(referring_channel, ' (', referring_category, ')')
            WHEN referring_channel IS NOT NULL 
            THEN referring_channel
            WHEN referrer_url IS NOT NULL 
            THEN referrer_url
            WHEN referrer IS NOT NULL 
            THEN referrer
            ELSE 'Direct'
          END,
          'Unknown'
        ) as top_referrer,
        SUM(gmv) as referrer_gmv,
        SUM(orders) as referrer_orders
      FROM referrer_attribution
      GROUP BY referring_channel, referring_category, referrer, referrer_url
      ORDER BY referrer_gmv DESC
      LIMIT 1
    )
    SELECT 
      COALESCE(trd.top_referrer, 'Unknown') as top_referrer,
      COALESCE(trd.referrer_gmv, 0) as referrer_gmv,
      COALESCE(trd.referrer_orders, 0) as referrer_orders
    FROM (SELECT 1 as dummy) d
    LEFT JOIN top_referrer_data trd ON 1=1
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    
    if (result.rows.length === 0) {
      return {
        data: {
          top_referrer: null,
          referrer_gmv: 0,
          referrer_orders: 0,
        },
        query,
      };
    }
    
    const row = result.rows[0];
    return {
      data: {
        top_referrer: row.top_referrer ? String(row.top_referrer) : null,
        referrer_gmv: Number(row.referrer_gmv || 0),
        referrer_orders: Number(row.referrer_orders || 0),
      },
      query,
    };
  } catch (error) {
    console.error('Error fetching referrer data:', error);
    return {
      data: {
        top_referrer: null,
        referrer_gmv: 0,
        referrer_orders: 0,
      },
      query,
    };
  }
}

/**
 * Get channel performance with YoY comparison
 * Uses merchant_sales.orders for sales_channel data
 * Supports single shop or multiple shops (aggregates results)
 */
export async function getChannelPerformance(
  shopIds: string | string[],
  startDate2025: string,
  endDate2025: string,
  startDate2024: string,
  endDate2024: string
): Promise<ChannelPerformance[]> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period_2025 AS (
      SELECT 
        TIMESTAMP('${startDate2025} 00:00:00') as start_date,
        TIMESTAMP('${endDate2025} 23:59:59') as end_date
    ),
    sale_period_2024 AS (
      SELECT 
        TIMESTAMP('${startDate2024} 00:00:00') as start_date,
        TIMESTAMP('${endDate2024} 23:59:59') as end_date
    ),
      successful_orders_2025 AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period_2025 sp
      -- shop_id is INT64 in BigQuery - compare directly (more efficient than casting)
      WHERE otps.shop_id IN (${shopIdList})
        -- Use direct timestamp comparison for partition pruning (DW best practice)
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        -- Partition filter for performance (required per Data Portal MCP findings)
        AND otps._extracted_at >= TIMESTAMP('${startDate2025}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id
    ),
    successful_orders_2024 AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period_2024 sp
      -- shop_id is INT64 in BigQuery - compare directly (more efficient than casting)
      WHERE otps.shop_id IN (${shopIdList})
        -- Use direct timestamp comparison for partition pruning (DW best practice)
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        -- Partition filter for performance (required per Data Portal MCP findings)
        AND otps._extracted_at >= TIMESTAMP('${startDate2024}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id
    ),
    orders_with_channels_2025 AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount,
        -- Use api_client_type and is_pos from order_transactions_payments_summary for channel detection
        CASE 
          WHEN otps.api_client_type = 'Retail' THEN 'pos'
          WHEN otps.is_pos = TRUE THEN 'pos'
          WHEN otps.api_client_type = 'B2B' THEN 'b2b'
          WHEN otps.api_client_type = 'Shop' THEN 'shop'
          ELSE 'online'
        END as channel_type
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period_2025 sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate2025}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id, channel_type
    ),
    orders_with_channels_2024 AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount,
        -- Use api_client_type and is_pos from order_transactions_payments_summary for channel detection
        CASE 
          WHEN otps.api_client_type = 'Retail' THEN 'pos'
          WHEN otps.is_pos = TRUE THEN 'pos'
          WHEN otps.api_client_type = 'B2B' THEN 'b2b'
          WHEN otps.api_client_type = 'Shop' THEN 'shop'
          ELSE 'online'
        END as channel_type
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period_2024 sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate2024}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id, channel_type
    ),
    channel_performance_2025 AS (
      SELECT 
        channel_type,
        SUM(order_amount) as gmv_2025,
        COUNT(DISTINCT order_id) as orders_2025
      FROM orders_with_channels_2025
      GROUP BY channel_type
    ),
    channel_performance_2024 AS (
      SELECT 
        channel_type,
        SUM(order_amount) as gmv_2024,
        COUNT(DISTINCT order_id) as orders_2024
      FROM orders_with_channels_2024
      GROUP BY channel_type
    )
    SELECT 
      cp2025.channel_type,
      cp2025.gmv_2025,
      cp2025.orders_2025,
      COALESCE(cp2024.gmv_2024, 0) as gmv_2024,
      COALESCE(cp2024.orders_2024, 0) as orders_2024,
      SAFE_DIVIDE((cp2025.gmv_2025 - COALESCE(cp2024.gmv_2024, 0)), NULLIF(COALESCE(cp2024.gmv_2024, 0), 0)) * 100 as yoy_growth_pct
    FROM channel_performance_2025 cp2025
    LEFT JOIN channel_performance_2024 cp2024 ON cp2025.channel_type = cp2024.channel_type
    ORDER BY yoy_growth_pct DESC NULLS LAST
  `;

  try {
  const result = await quickAPI.queryBigQuery(query);
  
  return result.rows.map((row) => ({
      channel_type: String(row.channel_type || 'Unknown'),
    gmv_2025: Number(row.gmv_2025 || 0),
    orders_2025: Number(row.orders_2025 || 0),
    gmv_2024: Number(row.gmv_2024 || 0),
    orders_2024: Number(row.orders_2024 || 0),
    yoy_growth_pct: Number(row.yoy_growth_pct || 0),
  }));
  } catch (error) {
    console.error('Error fetching channel performance:', error);
    return [];
  }
}

/**
 * Get Shopify-wide BFCM stats (aggregate across all shops)
 * Returns official BFCM 2025 platform stats for the BFCM period
 */
export async function getShopifyBFCMStats(
  startDate: string,
  endDate: string
): Promise<ShopifyBFCMStats | null> {
  // Check if dates match BFCM 2025 (Nov 28 - Dec 1, 2025)
  const bfcm2025Start = '2025-11-28';
  const bfcm2025End = '2025-12-01';
  
  // Also check for BFCM 2024 dates for historical context
  const bfcm2024Start = '2024-11-28';
  const bfcm2024End = '2024-12-01';
  
  const isBFCM2025 = startDate === bfcm2025Start && endDate === bfcm2025End;
  const isBFCM2024 = startDate === bfcm2024Start && endDate === bfcm2024End;
  
  if (isBFCM2025) {
    // Official BFCM 2025 platform stats
    return {
      total_gmv_processed: 14600000000, // $14.6 billion
      peak_gmv_per_minute: 5100000, // $5.1 million per minute
      peak_minute: '2025-11-28T12:01:00', // 12:01 PM EST on Black Friday
      total_orders: 0, // Not provided in official stats
      total_shops: 94900, // 94,900+ merchants had their best day ever
    };
  } else if (isBFCM2024) {
    // BFCM 2024 stats for comparison (estimated from 27% YoY growth)
    // $14.6B / 1.27 ≈ $11.5B
    return {
      total_gmv_processed: 11500000000, // ~$11.5 billion (estimated)
      peak_gmv_per_minute: 4600000, // $4.6 million per minute (from context)
      peak_minute: '2024-11-28T12:01:00',
      total_orders: 0,
      total_shops: 0,
    };
  }
  
  // For other date ranges, return null (platform-wide stats not available)
  console.warn('⚠️ Platform-wide stats only available for BFCM 2025 dates (Nov 28 - Dec 1, 2025)');
  return null;
}

/**
 * Get per-shop breakdown for multi-store reporting
 * Returns metrics for each selected shop
 */
export async function getShopBreakdown(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<ShopBreakdown[]> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT 
        otps.order_id,
        otps.shop_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id, otps.shop_id
    ),
    order_units AS (
      SELECT 
        so.order_id,
        so.shop_id,
        SUM(li.quantity) as total_units
      FROM successful_orders so
      LEFT JOIN \`shopify-dw.merchant_sales.line_items\` li
        ON so.order_id = li.order_id
        AND so.shop_id = li.shop_id
      GROUP BY so.order_id, so.shop_id
    ),
    shop_metrics AS (
      SELECT 
        CAST(so.shop_id AS STRING) as shop_id,
        COUNT(DISTINCT so.order_id) as total_orders,
        SUM(so.order_amount) as total_gmv,
        AVG(so.order_amount) as aov,
        AVG(COALESCE(ou.total_units, 0)) as units_per_transaction
      FROM successful_orders so
      LEFT JOIN order_units ou ON so.order_id = ou.order_id AND so.shop_id = ou.shop_id
      GROUP BY so.shop_id
    )
    SELECT 
      sm.shop_id,
      COALESCE(spc.name, CAST(sm.shop_id AS STRING)) as shop_name,
      sm.total_orders,
      sm.total_gmv,
      sm.aov,
      sm.units_per_transaction
    FROM shop_metrics sm
    LEFT JOIN \`shopify-dw.accounts_and_administration.shop_profile_current\` spc
      ON CAST(sm.shop_id AS INT64) = spc.shop_id
    ORDER BY sm.total_gmv DESC
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    return result.rows.map((row: any) => ({
      shop_id: String(row.shop_id || ''),
      shop_name: row.shop_name ? String(row.shop_name) : null,
      total_orders: Number(row.total_orders || 0),
      total_gmv: Number(row.total_gmv || 0),
      aov: Number(row.aov || 0),
      units_per_transaction: Number(row.units_per_transaction || 0),
    }));
  } catch (error) {
    console.error('Error fetching shop breakdown:', error);
    return [];
  }
}

/**
 * Get discount metrics - discounted vs full price sales
 * Note: May return empty if discount fields aren't available in merchant_sales.orders
 */
export async function getDiscountMetrics(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<DiscountMetrics> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT DISTINCT
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
    ),
    line_item_discounts AS (
      SELECT 
        li.order_id,
        li.price_local,
        li.compare_at_price_local,
        li.quantity,
        -- Detect discounts using compare_at_price_local (more accurate per Data Portal MCP findings)
        CASE 
          WHEN li.compare_at_price_local IS NOT NULL 
            AND li.compare_at_price_local > 0 
            AND li.price_local < li.compare_at_price_local 
          THEN TRUE
          ELSE FALSE
        END as has_discount,
        -- Calculate discount amount per line item
        CASE 
          WHEN li.compare_at_price_local IS NOT NULL 
            AND li.compare_at_price_local > 0 
            AND li.price_local < li.compare_at_price_local 
          THEN (li.compare_at_price_local - li.price_local) * li.quantity
          ELSE 0
        END as discount_amount
      FROM \`shopify-dw.merchant_sales.line_items\` li
      INNER JOIN successful_orders so ON li.order_id = so.order_id
      WHERE li.shop_id IN (${shopIdList})
        AND li.price_local IS NOT NULL
    ),
    order_discount_summary AS (
      SELECT 
        order_id,
        SUM(CASE WHEN has_discount THEN price_local * quantity ELSE 0 END) as discounted_sales,
        SUM(CASE WHEN NOT has_discount THEN price_local * quantity ELSE 0 END) as full_price_sales,
        SUM(price_local * quantity) as total_sales,
        SUM(discount_amount) as total_discount_amount
      FROM line_item_discounts
      GROUP BY order_id
    )
    SELECT 
      SUM(discounted_sales) as total_discounted_sales,
      SUM(full_price_sales) as total_full_price_sales,
      SUM(total_sales) as total_sales,
      SUM(total_discount_amount) as total_discount_amount
    FROM order_discount_summary
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    if (result.rows.length === 0) {
      return {
        total_discounted_sales: 0,
        total_full_price_sales: 0,
        discounted_sales_pct: 0,
        full_price_sales_pct: 0,
        total_discount_amount: 0,
      };
    }
    
    const row = result.rows[0];
    const totalSales = Number(row.total_sales || 0);
    const discountedSales = Number(row.total_discounted_sales || 0);
    const fullPriceSales = Number(row.total_full_price_sales || 0);
    
    return {
      total_discounted_sales: discountedSales,
      total_full_price_sales: fullPriceSales,
      discounted_sales_pct: totalSales > 0 ? (discountedSales / totalSales) * 100 : 0,
      full_price_sales_pct: totalSales > 0 ? (fullPriceSales / totalSales) * 100 : 0,
      total_discount_amount: Number(row.total_discount_amount || 0),
    };
  } catch (error) {
    console.error('Error fetching discount metrics:', error);
    // Return empty if discount fields aren't available
    return {
      total_discounted_sales: 0,
      total_full_price_sales: 0,
      discounted_sales_pct: 0,
      full_price_sales_pct: 0,
      total_discount_amount: 0,
    };
  }
}

/**
 * Get international/cross-border sales
 * Note: Requires billing_country_code or shipping_country_code fields
 */
export async function getInternationalSales(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<InternationalSales> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  try {
    // Get top countries
    const countryQuery = `
      WITH sale_period AS (
        SELECT 
          TIMESTAMP('${startDate} 00:00:00') as start_date,
          TIMESTAMP('${endDate} 23:59:59') as end_date
      ),
    successful_orders AS (
      SELECT 
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
      GROUP BY otps.order_id
    ),
      order_countries AS (
        SELECT 
          o.order_id,
          so.order_amount,
          -- Use order_buyer_locations for country data (per Data Portal MCP findings)
          -- This table provides estimated_country_code based on shipping/billing/location
          COALESCE(obl.estimated_country_code, 'UNKNOWN') as country_code
        FROM \`shopify-dw.merchant_sales.orders\` o
        INNER JOIN successful_orders so ON o.order_id = so.order_id
        LEFT JOIN \`shopify-dw.merchant_sales.order_buyer_locations\` obl
          ON o.order_id = obl.order_id
        WHERE o.shop_id IN (${shopIdList})
          AND NOT o.is_deleted
          AND NOT o.is_cancelled
          AND o.is_test = FALSE
          AND obl.estimated_country_code IS NOT NULL
      )
      SELECT 
        country_code as country,
        SUM(order_amount) as gmv,
        COUNT(DISTINCT order_id) as orders
      FROM order_countries
      WHERE country_code IS NOT NULL
      GROUP BY country_code
      ORDER BY gmv DESC
      LIMIT 10
    `;
    
    let topCountries: Array<{ country: string; gmv: number; orders: number }> = [];
    try {
      const countryResult = await quickAPI.queryBigQuery(countryQuery);
      topCountries = countryResult.rows.map((r: any) => ({
        country: String(r.country || ''),
        gmv: Number(r.gmv || 0),
        orders: Number(r.orders || 0),
      }));
    } catch (err) {
      console.warn('Could not fetch top countries:', err);
    }
    
    // Cross-border detection would require knowing shop's base country
    // For now, return top countries but mark cross-border as 0
    return {
      cross_border_gmv: 0, // Would need shop base country to calculate
      cross_border_orders: 0,
      cross_border_pct: 0,
      top_countries: topCountries,
    };
  } catch (error) {
    console.error('Error fetching international sales:', error);
    return {
      cross_border_gmv: 0,
      cross_border_orders: 0,
      cross_border_pct: 0,
      top_countries: [],
    };
  }
}

/**
 * Calculate Units Per Transaction (IPT) for all orders
 */
export async function getUnitsPerTransaction(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<number> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT DISTINCT
        otps.order_id
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
    ),
    order_units AS (
      SELECT 
        so.order_id,
        SUM(li.quantity) as total_units
      FROM successful_orders so
      LEFT JOIN \`shopify-dw.merchant_sales.line_items\` li
        ON so.order_id = li.order_id
        AND li.shop_id IN (${shopIdList})
      GROUP BY so.order_id
    )
    SELECT 
      AVG(COALESCE(total_units, 0)) as avg_units_per_transaction
    FROM order_units
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    if (result.rows.length === 0) {
      return 0;
    }
    return Number(result.rows[0].avg_units_per_transaction || 0);
  } catch (error) {
    console.error('Error calculating units per transaction:', error);
    return 0;
  }
}

/**
 * Enhanced conversion funnel using available order data
 * Estimates funnel stages based on order creation and processing
 */
export async function getConversionMetrics(
  shopIds: string | string[],
  startDate: string,
  endDate: string
): Promise<ConversionMetrics> {
  const { sqlList: shopIdList } = parseShopIds(shopIds);
  
  // Since we don't have session data, we'll estimate based on orders
  // This is an approximation - actual session data would require analytics tables
  const query = `
    WITH sale_period AS (
      SELECT 
        TIMESTAMP('${startDate} 00:00:00') as start_date,
        TIMESTAMP('${endDate} 23:59:59') as end_date
    ),
    successful_orders AS (
      SELECT DISTINCT
        otps.order_id,
        SUM(otps.amount_local) as order_amount
      FROM \`shopify-dw.money_products.order_transactions_payments_summary\` otps
      CROSS JOIN sale_period sp
      WHERE otps.shop_id IN (${shopIdList})
        AND otps.order_transaction_processed_at >= sp.start_date
        AND otps.order_transaction_processed_at <= sp.end_date
        AND otps._extracted_at >= TIMESTAMP('${startDate}')
        AND otps.order_transaction_kind = 'capture'
        AND otps.order_transaction_status = 'success'
        AND NOT otps.is_test
    ),
    order_details AS (
      SELECT 
        o.order_id,
        o.shop_id
      FROM \`shopify-dw.merchant_sales.orders\` o
      INNER JOIN successful_orders so ON o.order_id = so.order_id
      WHERE o.shop_id IN (${shopIdList})
        AND NOT o.is_deleted
        AND NOT o.is_cancelled
        AND o.is_test = FALSE
    )
    SELECT 
      COUNT(DISTINCT od.order_id) as total_orders
    FROM order_details od
  `;
  
  try {
    const result = await quickAPI.queryBigQuery(query);
    const totalOrders = result.rows.length > 0 ? Number(result.rows[0].total_orders || 0) : 0;
    
    // Estimate sessions based on typical e-commerce conversion rates (2-3% average)
    // This is a rough approximation since we don't have actual session data
    const estimatedSessions = totalOrders > 0 ? Math.round(totalOrders / 0.025) : 0; // Assume 2.5% conversion rate
    const estimatedSessionsWithCart = Math.round(estimatedSessions * 0.15); // ~15% add to cart rate
    const estimatedSessionsWithCheckout = Math.round(estimatedSessions * 0.05); // ~5% reach checkout
    
    return {
      total_sessions: estimatedSessions,
      sessions_with_cart: estimatedSessionsWithCart,
      sessions_with_checkout: estimatedSessionsWithCheckout,
      cart_to_checkout_rate: estimatedSessionsWithCart > 0 
        ? (estimatedSessionsWithCheckout / estimatedSessionsWithCart) * 100 
        : 0,
      mobile_sessions: Math.round(estimatedSessions * 0.6), // Estimate 60% mobile
      desktop_sessions: Math.round(estimatedSessions * 0.4), // Estimate 40% desktop
      conversion_rate: estimatedSessions > 0 ? (totalOrders / estimatedSessions) * 100 : 0,
    };
  } catch (error) {
    console.error('Error fetching conversion metrics:', error);
    return {
      total_sessions: 0,
      sessions_with_cart: 0,
      sessions_with_checkout: 0,
      cart_to_checkout_rate: 0,
      mobile_sessions: 0,
      desktop_sessions: 0,
      conversion_rate: 0,
    };
  }
}
