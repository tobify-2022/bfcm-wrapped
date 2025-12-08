/**
 * Chart Data Transformers
 * 
 * Transforms BigQuery query results into Recharts-compatible data structures
 */

import {
  ConversionMetrics,
  ChannelPerformance,
  ProductPerformance,
  ShopBreakdown,
  CustomerInsights,
} from './bfcm-queries';

/**
 * Funnel Chart Data Interface
 */
export interface FunnelDataPoint {
  name: string;
  value: number;
  label: string;
  visualValue: number;
  fill: string;
}

/**
 * Prepare conversion funnel data for Recharts FunnelChart
 */
export function prepareFunnelData(conversionMetrics: ConversionMetrics, totalOrders: number): FunnelDataPoint[] {
  const { 
    total_sessions, 
    sessions_with_cart,
    sessions_with_checkout
  } = conversionMetrics;

  // Calculate percentages
  const addToCartRate = total_sessions > 0 
    ? ((sessions_with_cart / total_sessions) * 100)
    : 0;
  
  const checkoutRate = total_sessions > 0
    ? ((sessions_with_checkout / total_sessions) * 100)
    : 0;
  
  const conversionRate = total_sessions > 0
    ? ((totalOrders / total_sessions) * 100)
    : 0;

  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981'];

  return [
    {
      name: 'Sessions',
      value: 100,
      label: `${total_sessions.toLocaleString()} (100%)`,
      visualValue: 100,
      fill: COLORS[0]
    },
    {
      name: 'Add to Cart',
      value: addToCartRate,
      label: `${sessions_with_cart.toLocaleString()} (${addToCartRate.toFixed(1)}%)`,
      visualValue: 75,
      fill: COLORS[1]
    },
    {
      name: 'Checkout',
      value: checkoutRate,
      label: `${sessions_with_checkout.toLocaleString()} (${checkoutRate.toFixed(1)}%)`,
      visualValue: 50,
      fill: COLORS[2]
    },
    {
      name: 'Converted',
      value: conversionRate,
      label: `${totalOrders.toLocaleString()} (${conversionRate.toFixed(1)}%)`,
      visualValue: 25,
      fill: COLORS[3]
    },
  ];
}

/**
 * Pie Chart Data Interface
 */
export interface PieDataPoint {
  name: string;
  value: number;
  fill: string;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

/**
 * Prepare channel performance data for Recharts PieChart
 */
export function prepareChannelPieData(channelPerformance: ChannelPerformance[]): PieDataPoint[] {
  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
  
  // Calculate total GMV for percentage
  const totalGMV = channelPerformance.reduce((sum, channel) => sum + channel.gmv_2025, 0);
  
  return channelPerformance
    .filter(channel => channel.gmv_2025 > 0)
    .map((channel, index) => ({
      name: channel.channel_type,
      value: channel.gmv_2025,
      fill: COLORS[index % COLORS.length],
      percentage: totalGMV > 0 ? (channel.gmv_2025 / totalGMV) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Bar Chart Data Interface
 */
export interface BarDataPoint {
  name: string;
  value: number;
  label: string;
  fill: string;
}

/**
 * Prepare top products data for Recharts BarChart
 */
export function prepareProductBarData(topProducts: ProductPerformance[]): BarDataPoint[] {
  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ec4899'];
  
  return topProducts
    .slice(0, 5) // Top 5 products
    .map((product, index) => ({
      name: product.product_title || 'Unknown Product',
      value: product.revenue || 0,
      label: formatCurrency(product.revenue || 0),
      fill: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Prepare shop breakdown data for Recharts BarChart
 */
export function prepareShopBarData(shopBreakdown: ShopBreakdown[]): BarDataPoint[] {
  const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
  
  return shopBreakdown
    .filter(shop => shop.total_gmv > 0)
    .map((shop, index) => ({
      name: shop.shop_name || `Shop ${shop.shop_id}`,
      value: shop.total_gmv,
      label: formatCurrency(shop.total_gmv),
      fill: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Comparison Data Interface for side-by-side comparisons
 */
export interface ComparisonDataPoint {
  name: string;
  current: number;
  previous: number;
}

/**
 * Prepare year-over-year comparison data
 */
export function prepareComparisonData(
  label: string,
  currentValue: number,
  previousValue: number
): ComparisonDataPoint {
  return {
    name: label,
    current: currentValue,
    previous: previousValue
  };
}

/**
 * Customer Segment Data for visualization
 */
export interface CustomerSegmentData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

/**
 * Prepare customer segmentation data (new vs returning)
 */
export function prepareCustomerSegmentData(customerInsights: CustomerInsights): CustomerSegmentData[] {
  const newCustomers = customerInsights.new_customers || 0;
  const returningCustomers = customerInsights.returning_customers || 0;
  const total = newCustomers + returningCustomers;

  if (total === 0) {
    return [];
  }

  return [
    {
      name: 'New Customers',
      value: newCustomers,
      percentage: (newCustomers / total) * 100,
      fill: '#667eea'
    },
    {
      name: 'Returning Customers',
      value: returningCustomers,
      percentage: (returningCustomers / total) * 100,
      fill: '#10b981'
    }
  ];
}

/**
 * Prepare device breakdown data (mobile vs desktop)
 */
export function prepareDeviceData(conversionMetrics: ConversionMetrics): CustomerSegmentData[] {
  const { mobile_sessions, desktop_sessions } = conversionMetrics;
  const total = mobile_sessions + desktop_sessions;

  if (total === 0) {
    return [];
  }

  return [
    {
      name: 'Mobile',
      value: mobile_sessions,
      percentage: (mobile_sessions / total) * 100,
      fill: '#667eea'
    },
    {
      name: 'Desktop',
      value: desktop_sessions,
      percentage: (desktop_sessions / total) * 100,
      fill: '#764ba2'
    }
  ];
}

/**
 * Area Chart Data Interface for trend visualization
 */
export interface AreaDataPoint {
  name: string;
  value: number;
  label: string;
}

/**
 * Time Series Data for trends
 */
export interface TimeSeriesPoint {
  date: string;
  value: number;
}

/**
 * Helper: Format currency for labels
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Helper: Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Helper: Format number with abbreviation
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Calculate growth rate between two values
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

