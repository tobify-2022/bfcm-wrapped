/**
 * Report Data Transforms
 * 
 * Centralized calculations and derived metrics to eliminate duplication
 * Single source of truth for all computed values throughout the report
 */

import { ReportData } from '@/pages/Home';

export interface DerivedMetrics {
  // YoY Changes
  yoyGMVChange: number;
  yoyGMVChangePct: number;
  yoyOrdersChange: number;
  yoyOrdersChangePct: number;
  yoyAOVChange: number;
  yoyAOVChangePct: number;
  
  // Customer Metrics
  totalCustomers: number;
  newCustomerPct: number;
  returningCustomerPct: number;
  repeatCustomerRate: number;
  
  // Performance Metrics
  averageUPT: number;
  mobileSessionPct: number;
  desktopSessionPct: number;
  
  // Channel Metrics
  dominantChannel: {
    name: string;
    percentage: number;
    gmv: number;
  } | null;
  
  // Product Metrics
  topProductRevenue: number;
  topProductShare: number;
  
  // Overall Performance Grade
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  performanceScore: number; // 0-100
  
  // Growth Status
  isGrowing: boolean;
  growthRate: 'exceptional' | 'strong' | 'moderate' | 'flat' | 'declining';
}

/**
 * Compute all derived metrics from raw report data
 * Memoize expensive calculations for performance
 */
export function computeDerivedMetrics(data: ReportData): DerivedMetrics {
  // YoY Calculations
  const yoyGMVChange = data.metrics2025.total_gmv - data.metrics2024.total_gmv;
  const yoyGMVChangePct = data.metrics2024.total_gmv > 0
    ? (yoyGMVChange / data.metrics2024.total_gmv) * 100
    : data.metrics2025.total_gmv > 0 ? 100 : 0;
  
  const yoyOrdersChange = data.metrics2025.total_orders - data.metrics2024.total_orders;
  const yoyOrdersChangePct = data.metrics2024.total_orders > 0
    ? (yoyOrdersChange / data.metrics2024.total_orders) * 100
    : data.metrics2025.total_orders > 0 ? 100 : 0;
  
  const yoyAOVChange = data.metrics2025.aov - data.metrics2024.aov;
  const yoyAOVChangePct = data.metrics2024.aov > 0
    ? (yoyAOVChange / data.metrics2024.aov) * 100
    : data.metrics2025.aov > 0 ? 100 : 0;
  
  // Customer Calculations
  const totalCustomers = data.customerInsights.new_customers + data.customerInsights.returning_customers;
  const newCustomerPct = totalCustomers > 0
    ? (data.customerInsights.new_customers / totalCustomers) * 100
    : 0;
  const returningCustomerPct = totalCustomers > 0
    ? (data.customerInsights.returning_customers / totalCustomers) * 100
    : 0;
  const repeatCustomerRate = returningCustomerPct;
  
  // Session Calculations
  const totalSessions = data.conversionMetrics.mobile_sessions + data.conversionMetrics.desktop_sessions;
  const mobileSessionPct = totalSessions > 0
    ? (data.conversionMetrics.mobile_sessions / totalSessions) * 100
    : 0;
  const desktopSessionPct = totalSessions > 0
    ? (data.conversionMetrics.desktop_sessions / totalSessions) * 100
    : 0;
  
  // Channel Analysis
  let dominantChannel = null;
  if (data.channelPerformance.length > 0) {
    const totalChannelGMV = data.channelPerformance.reduce((sum, ch) => sum + ch.gmv_2025, 0);
    const topChannel = [...data.channelPerformance].sort((a, b) => b.gmv_2025 - a.gmv_2025)[0];
    if (topChannel && totalChannelGMV > 0) {
      dominantChannel = {
        name: topChannel.channel_type,
        percentage: (topChannel.gmv_2025 / totalChannelGMV) * 100,
        gmv: topChannel.gmv_2025
      };
    }
  }
  
  // Product Analysis
  const topProductRevenue = data.topProducts.length > 0 ? data.topProducts[0].revenue : 0;
  const totalProductRevenue = data.topProducts.reduce((sum, p) => sum + p.revenue, 0);
  const topProductShare = totalProductRevenue > 0
    ? (topProductRevenue / totalProductRevenue) * 100
    : 0;
  
  // Average UPT
  const averageUPT = data.unitsPerTransaction || 0;
  
  // Performance Scoring
  const performanceScore = calculatePerformanceScore(data, yoyGMVChangePct);
  const performanceGrade = getPerformanceGrade(performanceScore);
  
  // Growth Classification
  const isGrowing = yoyGMVChangePct > 0;
  const growthRate = classifyGrowthRate(yoyGMVChangePct);
  
  return {
    yoyGMVChange,
    yoyGMVChangePct,
    yoyOrdersChange,
    yoyOrdersChangePct,
    yoyAOVChange,
    yoyAOVChangePct,
    totalCustomers,
    newCustomerPct,
    returningCustomerPct,
    repeatCustomerRate,
    averageUPT,
    mobileSessionPct,
    desktopSessionPct,
    dominantChannel,
    topProductRevenue,
    topProductShare,
    performanceGrade,
    performanceScore,
    isGrowing,
    growthRate
  };
}

/**
 * Calculate overall performance score (0-100)
 */
function calculatePerformanceScore(data: ReportData, yoyGrowth: number): number {
  let score = 0;
  
  // Growth component (30 points)
  if (yoyGrowth > 50) score += 30;
  else if (yoyGrowth > 30) score += 25;
  else if (yoyGrowth > 15) score += 20;
  else if (yoyGrowth > 0) score += 15;
  else if (yoyGrowth > -10) score += 10;
  
  // Conversion rate component (25 points)
  const cr = data.conversionMetrics.conversion_rate;
  if (cr > 3.5) score += 25;
  else if (cr > 2.5) score += 20;
  else if (cr > 1.5) score += 15;
  else if (cr > 1) score += 10;
  else score += 5;
  
  // Customer loyalty component (20 points)
  const totalCustomers = data.customerInsights.new_customers + data.customerInsights.returning_customers;
  const repeatRate = totalCustomers > 0
    ? (data.customerInsights.returning_customers / totalCustomers) * 100
    : 0;
  if (repeatRate > 40) score += 20;
  else if (repeatRate > 30) score += 15;
  else if (repeatRate > 20) score += 10;
  else score += 5;
  
  // AOV component (15 points)
  const aov = data.metrics2025.aov;
  if (aov > 150) score += 15;
  else if (aov > 100) score += 12;
  else if (aov > 75) score += 9;
  else if (aov > 50) score += 6;
  else score += 3;
  
  // GMV scale component (10 points)
  const gmv = data.metrics2025.total_gmv;
  if (gmv > 10000000) score += 10; // $10M+
  else if (gmv > 5000000) score += 8; // $5M+
  else if (gmv > 1000000) score += 6; // $1M+
  else if (gmv > 500000) score += 4; // $500K+
  else score += 2;
  
  return Math.min(score, 100);
}

/**
 * Get letter grade from performance score
 */
function getPerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Classify growth rate
 */
function classifyGrowthRate(yoyPct: number): 'exceptional' | 'strong' | 'moderate' | 'flat' | 'declining' {
  if (yoyPct > 30) return 'exceptional';
  if (yoyPct > 15) return 'strong';
  if (yoyPct > 0) return 'moderate';
  if (yoyPct > -10) return 'flat';
  return 'declining';
}

/**
 * Format currency consistently
 */
export function formatCurrency(value: number, compact: boolean = false): string {
  if (compact && value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (compact && value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage consistently
 */
export function formatPercent(value: number, showSign: boolean = true): string {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format number with abbreviation
 */
export function formatNumber(value: number, compact: boolean = false): string {
  if (compact && value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (compact && value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('en-US');
}
