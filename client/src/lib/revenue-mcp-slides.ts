/**
 * Revenue MCP - Google Slides Generation
 * 
 * This module handles automatic generation of Google Slides presentations
 * from BFCM report data using the Revenue MCP's slide creation tools.
 * 
 * SETUP REQUIRED:
 * 1. Create a Google Slides template with {{variable}} placeholders
 * 2. Get the template ID from the URL: docs.google.com/presentation/d/{TEMPLATE_ID}/edit
 * 3. Set BFCM_SLIDE_TEMPLATE_ID environment variable or pass directly
 * 
 * WORKFLOW:
 * 1. Call getTemplateVariables() to see what placeholders exist
 * 2. Call generateBFCMSlides() with report data to create presentation
 * 3. Receive Google Slides URL for the generated deck
 */

import { ReportData } from '@/pages/Home';

// Type definitions for Revenue MCP responses
interface SlideCreationResult {
  success: boolean;
  presentation_id: string;
  presentation_url: string;
  title: string;
  slides_count: number;
  error?: string;
}

interface TemplateVariable {
  variable: string;
  description?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default template ID - Update this after creating your template
 * Get from: https://docs.google.com/presentation/d/{THIS_IS_THE_ID}/edit
 */
const DEFAULT_TEMPLATE_ID = ''; // TODO: Set your template ID here

/**
 * Get template ID from environment or default
 */
function getTemplateId(): string {
  // Check if running in Quick environment with env vars
  if (typeof window !== 'undefined' && (window as any).BFCM_SLIDE_TEMPLATE_ID) {
    return (window as any).BFCM_SLIDE_TEMPLATE_ID;
  }
  
  if (!DEFAULT_TEMPLATE_ID) {
    throw new Error(
      'BFCM Slide Template ID not configured. ' +
      'Please set DEFAULT_TEMPLATE_ID in revenue-mcp-slides.ts or ' +
      'configure BFCM_SLIDE_TEMPLATE_ID environment variable.'
    );
  }
  
  return DEFAULT_TEMPLATE_ID;
}

// ============================================================================
// REVENUE MCP INTEGRATION
// ============================================================================

/**
 * Get all template variables from the Google Slides template
 * This helps you understand what placeholders need to be filled
 */
export async function getTemplateVariables(
  templateId?: string
): Promise<TemplateVariable[]> {
  const id = templateId || getTemplateId();
  
  try {
    const response = await fetch('/api/revenue-mcp/get-template-variables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template_id: id }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template variables: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.variables || [];
  } catch (error) {
    console.error('Error fetching template variables:', error);
    throw error;
  }
}

/**
 * Create a Google Slides presentation from report data
 */
export async function generateBFCMSlides(
  reportData: ReportData,
  templateId?: string,
  customTitle?: string
): Promise<SlideCreationResult> {
  const id = templateId || getTemplateId();
  const replacements = buildReplacements(reportData);
  const title = customTitle || `${reportData.accountName} - BFCM ${new Date().getFullYear()} Report`;
  
  try {
    const response = await fetch('/api/revenue-mcp/create-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: id,
        new_title: title,
        replacements,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create slides: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      presentation_id: result.presentation_id,
      presentation_url: result.presentation_url,
      title: result.title,
      slides_count: result.slides_count || 0,
    };
  } catch (error) {
    console.error('Error generating BFCM slides:', error);
    return {
      success: false,
      presentation_id: '',
      presentation_url: '',
      title: '',
      slides_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Build replacement map from report data
 * Maps ReportData to template variables for Revenue MCP
 */
function buildReplacements(data: ReportData): Record<string, string> {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Calculate growth
  const gmvGrowth = data.metrics2024.total_gmv > 0
    ? ((data.metrics2025.total_gmv - data.metrics2024.total_gmv) / data.metrics2024.total_gmv) * 100
    : 0;

  const ordersGrowth = data.metrics2024.total_orders > 0
    ? ((data.metrics2025.total_orders - data.metrics2024.total_orders) / data.metrics2024.total_orders) * 100
    : 0;

  const replacements: Record<string, string> = {
    // Basic Info
    merchant_name: data.accountName,
    bfcm_year: '2025',
    report_date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    date_range: `${data.startDate} to ${data.endDate}`,
    
    // 2025 Metrics
    total_gmv: formatCurrency(data.metrics2025.total_gmv),
    total_gmv_raw: String(data.metrics2025.total_gmv),
    total_orders: formatNumber(data.metrics2025.total_orders),
    total_orders_raw: String(data.metrics2025.total_orders),
    aov: formatCurrency(data.metrics2025.aov),
    aov_raw: String(data.metrics2025.aov),
    
    // 2024 Metrics (Comparison)
    total_gmv_2024: formatCurrency(data.metrics2024.total_gmv),
    total_orders_2024: formatNumber(data.metrics2024.total_orders),
    aov_2024: formatCurrency(data.metrics2024.aov),
    
    // Growth
    gmv_growth: formatPercent(gmvGrowth),
    gmv_growth_raw: String(gmvGrowth.toFixed(1)),
    orders_growth: formatPercent(ordersGrowth),
    orders_growth_raw: String(ordersGrowth.toFixed(1)),
    
    // Peak Performance
    peak_gmv: data.peakGMV ? formatCurrency(data.peakGMV.peak_gmv_per_minute) : 'N/A',
    peak_minute: data.peakGMV ? new Date(data.peakGMV.peak_minute).toLocaleString() : 'N/A',
    
    // Top Products (Top 5)
    ...buildTopProductsReplacements(data.topProducts),
    
    // Customer Insights
    new_customers: formatNumber(data.customerInsights.new_customers),
    returning_customers: formatNumber(data.customerInsights.returning_customers),
    total_customers: formatNumber(data.customerInsights.total_customers || (data.customerInsights.new_customers + data.customerInsights.returning_customers)),
    returning_customer_pct: formatPercent(
      data.customerInsights.total_customers && data.customerInsights.total_customers > 0
        ? (data.customerInsights.returning_customers / data.customerInsights.total_customers) * 100
        : 0
    ),
    new_customer_pct: formatPercent(
      data.customerInsights.total_customers && data.customerInsights.total_customers > 0
        ? (data.customerInsights.new_customers / data.customerInsights.total_customers) * 100
        : 0
    ),
    top_customer_spend: formatCurrency(data.customerInsights.top_customer_spend),
    top_customer_orders: String(data.customerInsights.top_customer_orders),
    
    // Shop Pay
    shop_pay_orders: formatNumber(data.customerInsights.shop_pay_orders || 0),
    shop_pay_pct: formatPercent(data.customerInsights.shop_pay_pct || 0),
    
    // Channel Performance (Top channel)
    ...buildChannelReplacements(data.channelPerformance),
    
    // Retail Metrics
    retail_gmv: formatCurrency(data.retailMetrics.retail_gmv),
    retail_orders: formatNumber(data.retailMetrics.retail_orders),
    retail_aov: formatCurrency(data.retailMetrics.retail_aov),
    top_location: data.retailMetrics.top_location || 'N/A',
    
    // Conversion Metrics
    conversion_rate: formatPercent(data.conversionMetrics.conversion_rate),
    total_sessions: formatNumber(data.conversionMetrics.total_sessions),
    cart_to_checkout_rate: formatPercent(data.conversionMetrics.cart_to_checkout_rate),
    
    // Mobile vs Desktop
    mobile_sessions: formatNumber(data.conversionMetrics.mobile_sessions),
    desktop_sessions: formatNumber(data.conversionMetrics.desktop_sessions),
    mobile_pct: formatPercent(
      (data.conversionMetrics.mobile_sessions / data.conversionMetrics.total_sessions) * 100
    ),
    
    // Discount Metrics
    discounted_gmv: formatCurrency(data.discountMetrics.total_discounted_sales),
    full_price_gmv: formatCurrency(data.discountMetrics.total_full_price_sales),
    discount_pct: formatPercent(data.discountMetrics.discounted_sales_pct),
    
    // International
    international_gmv: formatCurrency(data.internationalSales.cross_border_gmv),
    international_pct: formatPercent(data.internationalSales.cross_border_pct),
    
    // Units Per Transaction
    upt: String(data.unitsPerTransaction.toFixed(2)),
    
    // Referrer
    top_referrer: data.referrerData.top_referrer || 'Direct',
    referrer_gmv: formatCurrency(data.referrerData.referrer_gmv),
    
    // Multi-Store Data
    ...buildMultiStoreReplacements(data.shopBreakdown),
  };

  return replacements;
}

/**
 * Build replacements for top products (up to 10)
 */
function buildTopProductsReplacements(products: any[]): Record<string, string> {
  const replacements: Record<string, string> = {};
  
  for (let i = 0; i < 10; i++) {
    const product = products[i];
    const index = i + 1;
    
    if (product) {
      replacements[`product_${index}_name`] = product.product_title || `Product ${index}`;
      replacements[`product_${index}_revenue`] = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(product.total_revenue);
      replacements[`product_${index}_units`] = String(product.units_sold);
    } else {
      replacements[`product_${index}_name`] = '';
      replacements[`product_${index}_revenue`] = '';
      replacements[`product_${index}_units`] = '';
    }
  }
  
  return replacements;
}

/**
 * Build replacements for channel performance
 */
function buildChannelReplacements(channels: any[]): Record<string, string> {
  const replacements: Record<string, string> = {};
  
  // Sort by GMV descending
  const sortedChannels = [...channels].sort((a, b) => b.gmv_2025 - a.gmv_2025);
  
  const channelNames = ['online', 'pos', 'b2b', 'shop'];
  
  for (const name of channelNames) {
    const channel = sortedChannels.find(c => c.channel_type === name);
    
    if (channel) {
      replacements[`${name}_gmv`] = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(channel.gmv_2025);
      replacements[`${name}_orders`] = String(channel.orders_2025);
      replacements[`${name}_growth`] = `${channel.yoy_growth_pct.toFixed(1)}%`;
    } else {
      replacements[`${name}_gmv`] = '$0';
      replacements[`${name}_orders`] = '0';
      replacements[`${name}_growth`] = '0%';
    }
  }
  
  // Top channel
  if (sortedChannels[0]) {
    replacements.top_channel = sortedChannels[0].channel_type.toUpperCase();
    replacements.top_channel_gmv = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(sortedChannels[0].gmv_2025);
  }
  
  return replacements;
}

/**
 * Build replacements for multi-store breakdown (up to 10 stores)
 */
function buildMultiStoreReplacements(shops: any[]): Record<string, string> {
  const replacements: Record<string, string> = {};
  
  // Sort by GMV descending
  const sortedShops = [...shops].sort((a, b) => b.gmv - a.gmv);
  
  for (let i = 0; i < 10; i++) {
    const shop = sortedShops[i];
    const index = i + 1;
    
    if (shop) {
      replacements[`store_${index}_name`] = shop.shop_name || `Store ${index}`;
      replacements[`store_${index}_gmv`] = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(shop.gmv);
      replacements[`store_${index}_orders`] = String(shop.orders);
      replacements[`store_${index}_aov`] = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(shop.aov);
    } else {
      replacements[`store_${index}_name`] = '';
      replacements[`store_${index}_gmv`] = '';
      replacements[`store_${index}_orders`] = '';
      replacements[`store_${index}_aov`] = '';
    }
  }
  
  return replacements;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Get all available replacement keys
 * Useful for debugging and template creation
 */
export function getAvailableReplacementKeys(sampleData: ReportData): string[] {
  const replacements = buildReplacements(sampleData);
  return Object.keys(replacements).sort();
}

/**
 * Preview replacements for debugging
 */
export function previewReplacements(reportData: ReportData): void {
  const replacements = buildReplacements(reportData);
  console.log('📊 BFCM Slide Replacements Preview:');
  console.log('===================================');
  
  for (const [key, value] of Object.entries(replacements)) {
    console.log(`{{${key}}} → ${value}`);
  }
  
  console.log('===================================');
  console.log(`Total variables: ${Object.keys(replacements).length}`);
}

