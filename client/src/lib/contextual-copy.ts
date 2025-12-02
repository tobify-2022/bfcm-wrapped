/**
 * Contextual Copy Generator
 * Creates engaging, personalized copy based on merchant data
 */

import { ReportData } from '@/pages/Home';
import { getPeakHourContext } from './commerce-personality';

/**
 * Platform-wide stats for contextualization - BFCM 2025
 */
const PLATFORM_STATS = {
  totalMerchants: 94900, // Merchants who had their best day ever
  totalCustomers: 81000000, // 81+ million consumers
  peakGMVPerMinute: 5100000, // $5.1M per minute at 12:01 PM EST
  totalGMV: 14600000000, // $14.6B global sales
  crossBorderPct: 16, // 16% cross-border orders
  shopPayOrdersPct: 32, // 32% of orders via Shop Pay
  shopPayYoY: 39, // 39% YoY increase in Shop Pay sales
  averageCart: 114.70, // $114.70 average cart price
};

/**
 * Generate contextual copy for GMV comparison
 */
export function getGMVContext(gmv: number): string {
  const percentage = (gmv / PLATFORM_STATS.totalGMV) * 100;
  if (percentage > 0.01) {
    return `You were part of ${PLATFORM_STATS.totalMerchants.toLocaleString()}+ merchants who had their best day ever on Shopify`;
  }
  return `You were part of something massive—${PLATFORM_STATS.totalCustomers.toLocaleString()}+ consumers worldwide bought from Shopify-powered brands`;
}

/**
 * Generate contextual copy for peak GMV
 */
export function getPeakGMVContext(peakGMV: number, peakMinute: string): string {
  const platformPeak = PLATFORM_STATS.peakGMVPerMinute;
  const percentage = (peakGMV / platformPeak) * 100;
  const context = getPeakHourContext(peakMinute);
  
  if (percentage > 1) {
    return `Your peak of ${(peakGMV / 1000).toFixed(0)}K/min was ${context}—you were part of the $${(platformPeak / 1000000).toFixed(1)}M/min platform peak at 12:01 PM EST!`;
  } else if (percentage > 0.1) {
    return `Your peak of ${(peakGMV / 1000).toFixed(0)}K/min happened ${context}—contributing to the $${(platformPeak / 1000000).toFixed(1)}M/min platform peak`;
  }
  return `Your peak of ${(peakGMV / 1000).toFixed(0)}K/min happened ${context}`;
}

/**
 * Generate contextual copy for customer insights
 */
export function getCustomerContext(data: ReportData): string {
  const totalCustomers = data.customerInsights.new_customers + data.customerInsights.returning_customers;
  const newPct = totalCustomers > 0 
    ? (data.customerInsights.new_customers / totalCustomers) * 100 
    : 0;
  
  if (newPct > 70) {
    return `You welcomed ${data.customerInsights.new_customers.toLocaleString()} new customers—${newPct.toFixed(0)}% of your BFCM shoppers were first-timers!`;
  } else if (newPct < 30) {
    return `Your loyal customers came back strong—${data.customerInsights.returning_customers.toLocaleString()} returning customers (${(100 - newPct).toFixed(0)}%)`;
  }
  return `You balanced growth and loyalty—${data.customerInsights.new_customers.toLocaleString()} new customers and ${data.customerInsights.returning_customers.toLocaleString()} returning fans`;
}

/**
 * Generate contextual copy for top customer
 */
export function getTopCustomerContext(data: ReportData): string {
  if (data.customerInsights.top_customer_orders > 1) {
    return `Someone ordered from you ${data.customerInsights.top_customer_orders} times during BFCM—now that's loyalty!`;
  }
  return `Your top customer spent ${(data.customerInsights.top_customer_spend / 1000).toFixed(0)}K—impressive!`;
}

/**
 * Generate contextual copy for international sales
 */
export function getInternationalContext(data: ReportData): string | null {
  const countryCount = data.internationalSales.top_countries.length;
  if (countryCount >= 10) {
    return `You're a true global seller—shipping to ${countryCount} countries!`;
  } else if (countryCount >= 5) {
    return `Your reach spans ${countryCount} countries—global commerce at its finest`;
  } else if (countryCount > 0) {
    return `You shipped to ${countryCount} ${countryCount === 1 ? 'country' : 'countries'}—expanding your reach`;
  }
  return null;
}

/**
 * Generate contextual copy for YoY growth
 */
export function getYoYGrowthContext(yoyChange: number): string {
  if (yoyChange > 100) {
    return `You more than doubled your sales—${yoyChange.toFixed(0)}% growth is incredible!`;
  } else if (yoyChange > 50) {
    return `You grew by ${yoyChange.toFixed(0)}%—that's a massive win!`;
  } else if (yoyChange > 20) {
    return `Strong ${yoyChange.toFixed(0)}% growth—you're on the right track!`;
  } else if (yoyChange > 0) {
    return `You grew by ${yoyChange.toFixed(0)}%—every step forward counts!`;
  } else if (yoyChange > -10) {
    return `You held steady—consistency is key in commerce`;
  } else {
    return `You're building for the future—this BFCM was a learning experience`;
  }
}

