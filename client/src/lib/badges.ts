/**
 * Badge & Achievement System
 * Creates visual badges for merchant achievements
 */

import { ReportData } from '@/pages/Home';

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  unlocked: boolean;
}

/**
 * Calculate all badges for a merchant based on their BFCM performance
 */
export function calculateBadges(data: ReportData): Badge[] {
  const badges: Badge[] = [];

  const yoyGMVChange = data.metrics2024.total_gmv > 0
    ? ((data.metrics2025.total_gmv - data.metrics2024.total_gmv) / data.metrics2024.total_gmv) * 100
    : 0;

  // Record Breaker - Best day ever or significant growth
  if (yoyGMVChange > 100 || data.metrics2024.total_gmv === 0) {
    badges.push({
      id: 'record-breaker',
      title: 'Record Breaker',
      description: yoyGMVChange > 100 
        ? `${yoyGMVChange.toFixed(0)}% growth from last year`
        : 'Your first BFCM—and you crushed it!',
      emoji: '🏆',
      gradient: 'from-amber-500 via-yellow-500 to-amber-600',
      unlocked: true,
    });
  }

  // Global Seller - 5+ countries
  if (data.internationalSales.top_countries.length >= 5) {
    badges.push({
      id: 'global-seller',
      title: 'Global Seller',
      description: `Shipped to ${data.internationalSales.top_countries.length} countries`,
      emoji: '🌍',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      unlocked: true,
    });
  }

  // Comeback Kid - 50%+ YoY growth
  if (yoyGMVChange >= 50 && data.metrics2024.total_gmv > 0) {
    badges.push({
      id: 'comeback-kid',
      title: 'Comeback Kid',
      description: `${yoyGMVChange.toFixed(0)}% growth—incredible comeback!`,
      emoji: '🚀',
      gradient: 'from-green-500 via-emerald-500 to-green-600',
      unlocked: true,
    });
  }

  // Millionaire - $1M+ GMV
  if (data.metrics2025.total_gmv >= 1000000) {
    badges.push({
      id: 'millionaire',
      title: 'Millionaire',
      description: 'Crossed the $1M mark',
      emoji: '💎',
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      unlocked: true,
    });
  }

  // Order Master - 10K+ orders
  if (data.metrics2025.total_orders >= 10000) {
    badges.push({
      id: 'order-master',
      title: 'Order Master',
      description: `${data.metrics2025.total_orders.toLocaleString()} orders fulfilled`,
      emoji: '📦',
      gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
      unlocked: true,
    });
  }

  // Night Owl - Peak sales after midnight
  if (data.peakGMV) {
    const peakHour = new Date(data.peakGMV.peak_minute).getHours();
    if (peakHour >= 0 && peakHour < 6) {
      badges.push({
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Peak sales in the wee hours',
        emoji: '🦉',
        gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
        unlocked: true,
      });
    }
  }

  // Omnichannel Champion - Both POS and online
  const hasPOS = data.retailMetrics.retail_orders > 0;
  const hasOnline = data.channelPerformance.some(c => c.channel_type === 'online');
  if (hasPOS && hasOnline) {
    badges.push({
      id: 'omnichannel-champion',
      title: 'Omnichannel Champion',
      description: 'Thriving across all channels',
      emoji: '🛍️',
      gradient: 'from-teal-500 via-cyan-500 to-teal-600',
      unlocked: true,
    });
  }

  // Customer Loyalty - High returning customer rate
  const totalCustomers = data.customerInsights.new_customers + data.customerInsights.returning_customers;
  if (totalCustomers > 0) {
    const returningRate = (data.customerInsights.returning_customers / totalCustomers) * 100;
    if (returningRate >= 60) {
      badges.push({
        id: 'customer-loyalty',
        title: 'Customer Loyalty',
        description: `${returningRate.toFixed(0)}% returning customers`,
        emoji: '❤️',
        gradient: 'from-red-500 via-pink-500 to-red-600',
        unlocked: true,
      });
    }
  }

  // First Timer - No 2024 data
  if (data.metrics2024.total_gmv === 0 && data.metrics2025.total_gmv > 0) {
    badges.push({
      id: 'first-timer',
      title: 'First Timer',
      description: 'Your first BFCM—welcome!',
      emoji: '🎉',
      gradient: 'from-pink-500 via-rose-500 to-pink-600',
      unlocked: true,
    });
  }

  // Speed Demon - High AOV
  if (data.metrics2025.aov >= 200) {
    badges.push({
      id: 'speed-demon',
      title: 'Speed Demon',
      description: `AOV of ${formatCurrency(data.metrics2025.aov)}—customers love your products!`,
      emoji: '⚡',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      unlocked: true,
    });
  }

  // Volume King - High units per transaction
  if (data.unitsPerTransaction >= 3) {
    badges.push({
      id: 'volume-king',
      title: 'Volume King',
      description: `${data.unitsPerTransaction.toFixed(1)} units per transaction—customers stock up!`,
      emoji: '📊',
      gradient: 'from-green-400 via-teal-500 to-blue-500',
      unlocked: true,
    });
  }

  // Discount Master - High discount sales percentage
  const totalSales = data.discountMetrics.total_discounted_sales + data.discountMetrics.total_full_price_sales;
  if (totalSales > 0 && data.discountMetrics.discounted_sales_pct >= 70) {
    badges.push({
      id: 'discount-master',
      title: 'Discount Master',
      description: `${data.discountMetrics.discounted_sales_pct.toFixed(0)}% of sales were discounted`,
      emoji: '🎯',
      gradient: 'from-purple-400 via-fuchsia-500 to-pink-500',
      unlocked: true,
    });
  }

  // Premium Player - Low discount percentage (high full-price sales)
  if (totalSales > 0 && data.discountMetrics.full_price_sales_pct >= 80) {
    badges.push({
      id: 'premium-player',
      title: 'Premium Player',
      description: `${data.discountMetrics.full_price_sales_pct.toFixed(0)}% full-price sales—premium positioning!`,
      emoji: '👑',
      gradient: 'from-amber-400 via-yellow-500 to-amber-600',
      unlocked: true,
    });
  }

  // Conversion Champion - High conversion rate
  if (data.conversionMetrics.conversion_rate >= 3) {
    badges.push({
      id: 'conversion-champion',
      title: 'Conversion Champion',
      description: `${data.conversionMetrics.conversion_rate.toFixed(2)}% conversion rate—excellent!`,
      emoji: '🎯',
      gradient: 'from-emerald-400 via-green-500 to-emerald-600',
      unlocked: true,
    });
  }

  // Mobile First - High mobile session percentage
  const totalSessions = data.conversionMetrics.mobile_sessions + data.conversionMetrics.desktop_sessions;
  if (totalSessions > 0) {
    const mobilePct = (data.conversionMetrics.mobile_sessions / totalSessions) * 100;
    if (mobilePct >= 70) {
      badges.push({
        id: 'mobile-first',
        title: 'Mobile First',
        description: `${mobilePct.toFixed(0)}% mobile traffic—mobile-optimized!`,
        emoji: '📱',
        gradient: 'from-blue-400 via-indigo-500 to-purple-500',
        unlocked: true,
      });
    }
  }

  // Peak Performer - Very high peak GMV per minute
  if (data.peakGMV && data.peakGMV.peak_gmv_per_minute >= 10000) {
    badges.push({
      id: 'peak-performer',
      title: 'Peak Performer',
      description: `${formatCurrency(data.peakGMV.peak_gmv_per_minute)}/min at peak—incredible surge!`,
      emoji: '🔥',
      gradient: 'from-red-400 via-orange-500 to-yellow-500',
      unlocked: true,
    });
  }

  // Growth Machine - Consistent growth across multiple metrics
  const yoyOrdersChange = data.metrics2024.total_orders > 0
    ? ((data.metrics2025.total_orders - data.metrics2024.total_orders) / data.metrics2024.total_orders) * 100
    : 0;
  if (yoyGMVChange > 20 && yoyOrdersChange > 20 && data.metrics2024.total_gmv > 0) {
    badges.push({
      id: 'growth-machine',
      title: 'Growth Machine',
      description: 'Growing across GMV and orders—momentum is real!',
      emoji: '🚀',
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      unlocked: true,
    });
  }

  // Cross-Border Hero - High international sales
  if (data.internationalSales.cross_border_pct >= 30) {
    badges.push({
      id: 'cross-border-hero',
      title: 'Cross-Border Hero',
      description: `${data.internationalSales.cross_border_pct.toFixed(0)}% international sales—global reach!`,
      emoji: '🌐',
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
      unlocked: true,
    });
  }

  // Top Product Powerhouse - One product dominates
  if (data.topProducts.length > 0) {
    const topProductRevenue = data.topProducts[0].revenue;
    const totalProductRevenue = data.topProducts.reduce((sum, p) => sum + p.revenue, 0);
    if (totalProductRevenue > 0 && (topProductRevenue / totalProductRevenue) >= 0.4) {
      badges.push({
        id: 'top-product-powerhouse',
        title: 'Top Product Powerhouse',
        description: `${((topProductRevenue / totalProductRevenue) * 100).toFixed(0)}% of revenue from one product!`,
        emoji: '⭐',
        gradient: 'from-yellow-300 via-amber-400 to-orange-500',
        unlocked: true,
      });
    }
  }

  // Retail Rockstar - High retail GMV percentage
  const totalGMV = data.metrics2025.total_gmv;
  if (totalGMV > 0 && data.retailMetrics.retail_gmv > 0) {
    const retailPct = (data.retailMetrics.retail_gmv / totalGMV) * 100;
    if (retailPct >= 50) {
      badges.push({
        id: 'retail-rockstar',
        title: 'Retail Rockstar',
        description: `${retailPct.toFixed(0)}% of sales from retail—brick & mortar champion!`,
        emoji: '🏪',
        gradient: 'from-teal-400 via-cyan-500 to-blue-500',
        unlocked: true,
      });
    }
  }

  // New Customer Magnet - High new customer percentage
  if (totalCustomers > 0) {
    const newPct = (data.customerInsights.new_customers / totalCustomers) * 100;
    if (newPct >= 70) {
      badges.push({
        id: 'new-customer-magnet',
        title: 'New Customer Magnet',
        description: `${newPct.toFixed(0)}% new customers—amazing acquisition!`,
        emoji: '🧲',
        gradient: 'from-violet-400 via-purple-500 to-fuchsia-500',
        unlocked: true,
    });
    }
  }

  return badges;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

