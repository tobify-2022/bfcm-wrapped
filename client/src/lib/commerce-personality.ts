/**
 * Commerce Personality Detection
 * Determines merchant archetypes based on BFCM behavior patterns
 */

import { ReportData } from '@/pages/Home';

export type CommercePersonality = 
  | 'night-owl' 
  | 'global-seller' 
  | 'comeback-kid' 
  | 'first-timer' 
  | 'record-breaker'
  | 'early-bird'
  | 'steady-eddie'
  | 'speed-demon'
  | 'volume-king'
  | 'premium-player'
  | 'discount-master'
  | 'mobile-first'
  | 'retail-rockstar'
  | 'new-customer-magnet'
  | 'loyalty-legend'
  | 'peak-performer'
  | 'growth-machine'
  | null;

export interface PersonalityResult {
  type: CommercePersonality;
  title: string;
  description: string;
  emoji: string;
  color: string;
}

/**
 * Detect commerce personality based on merchant data
 */
export function detectCommercePersonality(data: ReportData): PersonalityResult[] {
  const personalities: PersonalityResult[] = [];

  // Night Owl - Peak sales after midnight
  if (data.peakGMV) {
    const peakHour = new Date(data.peakGMV.peak_minute).getHours();
    if (peakHour >= 0 && peakHour < 6) {
      personalities.push({
        type: 'night-owl',
        title: 'The Night Owl',
        description: 'Your customers shop when the world sleeps',
        emoji: '🦉',
        color: 'from-purple-500 to-indigo-600',
      });
    }
  }

  // Early Bird - Peak sales in morning
  if (data.peakGMV) {
    const peakHour = new Date(data.peakGMV.peak_minute).getHours();
    if (peakHour >= 6 && peakHour < 12) {
      personalities.push({
        type: 'early-bird',
        title: 'The Early Bird',
        description: 'You catch the morning shoppers',
        emoji: '🌅',
        color: 'from-yellow-400 to-orange-500',
      });
    }
  }

  // Global Seller - 5+ countries
  if (data.internationalSales.top_countries.length >= 5) {
    personalities.push({
      type: 'global-seller',
      title: 'The Global Seller',
      description: `You shipped to ${data.internationalSales.top_countries.length} countries`,
      emoji: '🌍',
      color: 'from-blue-500 to-cyan-600',
    });
  }

  // Comeback Kid - Biggest YoY growth
  const yoyGMVChange = data.metrics2024.total_gmv > 0
    ? ((data.metrics2025.total_gmv - data.metrics2024.total_gmv) / data.metrics2024.total_gmv) * 100
    : 0;
  
  if (yoyGMVChange > 50) {
    personalities.push({
      type: 'comeback-kid',
      title: 'The Comeback Kid',
      description: `${yoyGMVChange.toFixed(0)}% growth from last year`,
      emoji: '🚀',
      color: 'from-green-500 to-emerald-600',
    });
  }

  // First Timer - No 2024 data or very low
  if (data.metrics2024.total_gmv === 0 || data.metrics2024.total_orders === 0) {
    personalities.push({
      type: 'first-timer',
      title: 'The First Timer',
      description: 'Your first BFCM—and you crushed it!',
      emoji: '🎉',
      color: 'from-pink-500 to-rose-600',
    });
  }

  // Record Breaker - Best day ever (we'll need to add this logic)
  // For now, check if 2025 GMV is significantly higher than 2024
  if (data.metrics2024.total_gmv > 0 && yoyGMVChange > 100) {
    personalities.push({
      type: 'record-breaker',
      title: 'Record Breaker',
      description: 'You had your best BFCM ever',
      emoji: '🏆',
      color: 'from-amber-500 to-yellow-600',
    });
  }

  // Speed Demon - High AOV
  if (data.metrics2025.aov >= 200) {
    personalities.push({
      type: 'speed-demon',
      title: 'The Speed Demon',
      description: `Your AOV of ${(data.metrics2025.aov / 1000).toFixed(0)}K shows customers value quality`,
      emoji: '⚡',
      color: 'from-yellow-400 via-orange-500 to-red-500',
    });
  }

  // Volume King - High units per transaction
  if (data.unitsPerTransaction >= 3) {
    personalities.push({
      type: 'volume-king',
      title: 'The Volume King',
      description: `${data.unitsPerTransaction.toFixed(1)} units per order—customers stock up with you`,
      emoji: '📊',
      color: 'from-green-400 via-teal-500 to-blue-500',
    });
  }

  // Premium Player - Low discount percentage
  const totalSales = data.discountMetrics.total_discounted_sales + data.discountMetrics.total_full_price_sales;
  if (totalSales > 0 && data.discountMetrics.full_price_sales_pct >= 80) {
    personalities.push({
      type: 'premium-player',
      title: 'The Premium Player',
      description: `${data.discountMetrics.full_price_sales_pct.toFixed(0)}% full-price sales—premium positioning`,
      emoji: '👑',
      color: 'from-amber-400 via-yellow-500 to-amber-600',
    });
  }

  // Discount Master - High discount sales
  if (totalSales > 0 && data.discountMetrics.discounted_sales_pct >= 70) {
    personalities.push({
      type: 'discount-master',
      title: 'The Discount Master',
      description: `${data.discountMetrics.discounted_sales_pct.toFixed(0)}% discounted—strategic pricing wins`,
      emoji: '🎯',
      color: 'from-purple-400 via-fuchsia-500 to-pink-500',
    });
  }

  // Mobile First - High mobile percentage
  const totalSessions = data.conversionMetrics.mobile_sessions + data.conversionMetrics.desktop_sessions;
  if (totalSessions > 0) {
    const mobilePct = (data.conversionMetrics.mobile_sessions / totalSessions) * 100;
    if (mobilePct >= 70) {
      personalities.push({
        type: 'mobile-first',
        title: 'The Mobile First',
        description: `${mobilePct.toFixed(0)}% mobile traffic—you've mastered mobile commerce`,
        emoji: '📱',
        color: 'from-blue-400 via-indigo-500 to-purple-500',
      });
    }
  }

  // Retail Rockstar - High retail percentage
  const totalGMV = data.metrics2025.total_gmv;
  if (totalGMV > 0 && data.retailMetrics.retail_gmv > 0) {
    const retailPct = (data.retailMetrics.retail_gmv / totalGMV) * 100;
    if (retailPct >= 50) {
      personalities.push({
        type: 'retail-rockstar',
        title: 'The Retail Rockstar',
        description: `${retailPct.toFixed(0)}% retail sales—brick & mortar champion`,
        emoji: '🏪',
        color: 'from-teal-400 via-cyan-500 to-blue-500',
      });
    }
  }

  // New Customer Magnet - High new customer percentage
  const totalCustomers = data.customerInsights.new_customers + data.customerInsights.returning_customers;
  if (totalCustomers > 0) {
    const newPct = (data.customerInsights.new_customers / totalCustomers) * 100;
    if (newPct >= 70) {
      personalities.push({
        type: 'new-customer-magnet',
        title: 'The New Customer Magnet',
        description: `${newPct.toFixed(0)}% new customers—amazing acquisition power`,
        emoji: '🧲',
        color: 'from-violet-400 via-purple-500 to-fuchsia-500',
      });
    }
  }

  // Loyalty Legend - High returning customer rate
  if (totalCustomers > 0) {
    const returningRate = (data.customerInsights.returning_customers / totalCustomers) * 100;
    if (returningRate >= 60) {
      personalities.push({
        type: 'loyalty-legend',
        title: 'The Loyalty Legend',
        description: `${returningRate.toFixed(0)}% returning customers—you build lasting relationships`,
        emoji: '💎',
        color: 'from-red-400 via-pink-500 to-rose-500',
      });
    }
  }

  // Peak Performer - Very high peak GMV
  if (data.peakGMV && data.peakGMV.peak_gmv_per_minute >= 10000) {
    personalities.push({
      type: 'peak-performer',
      title: 'The Peak Performer',
      description: `${(data.peakGMV.peak_gmv_per_minute / 1000).toFixed(0)}K/min at peak—incredible surge capacity`,
      emoji: '🔥',
      color: 'from-red-400 via-orange-500 to-yellow-500',
    });
  }

  // Growth Machine - Consistent multi-metric growth
  const yoyOrdersChange = data.metrics2024.total_orders > 0
    ? ((data.metrics2025.total_orders - data.metrics2024.total_orders) / data.metrics2024.total_orders) * 100
    : 0;
  if (yoyGMVChange > 20 && yoyOrdersChange > 20 && data.metrics2024.total_gmv > 0) {
    personalities.push({
      type: 'growth-machine',
      title: 'The Growth Machine',
      description: 'Growing across all metrics—momentum is unstoppable',
      emoji: '🚀',
      color: 'from-green-400 via-emerald-500 to-teal-500',
    });
  }

  // Steady Eddie - Consistent performance (fallback)
  if (personalities.length === 0 && data.metrics2025.total_gmv > 0) {
    personalities.push({
      type: 'steady-eddie',
      title: 'Steady Eddie',
      description: 'Consistent performance, reliable results',
      emoji: '📊',
      color: 'from-gray-500 to-slate-600',
    });
  }

  return personalities;
}

/**
 * Get contextual time-based message for peak hour
 */
export function getPeakHourContext(peakMinute: string): string {
  const hour = new Date(peakMinute).getHours();
  const minute = new Date(peakMinute).getMinutes();
  
  // Special case for 12:01 PM EST (platform peak)
  if (hour === 12 && minute <= 5) {
    return 'right at 12:01 PM EST—when the platform hit $5.1M/min';
  }
  
  const contexts: Record<number, string> = {
    0: 'right when midnight shoppers were browsing',
    1: 'in the wee hours—dedicated night owls',
    2: 'when insomniacs were shopping',
    3: 'deep in the night—your most committed customers',
    4: 'before dawn—early risers found you',
    5: 'at sunrise—morning people starting their day',
    6: 'bright and early—coffee break shopping',
    7: 'morning rush—commuters on the go',
    8: 'work break time—office shoppers',
    9: 'mid-morning surge—productivity break',
    10: 'late morning—pre-lunch browsing',
    11: 'lunch hour—hungry shoppers',
    12: 'noon rush—lunch break shopping (right when the platform peaked!)',
    13: 'afternoon kickoff—post-lunch energy',
    14: 'mid-afternoon—afternoon slump shopping',
    15: 'late afternoon—pre-dinner browsing',
    16: 'evening prep—dinner planning',
    17: 'dinner time—cooking break shopping',
    18: 'evening rush—after work browsing',
    19: 'prime time—evening shoppers',
    20: 'night browsing—relaxing at home',
    21: 'late evening—wind-down shopping',
    22: 'night owls—late night browsing',
    23: 'midnight shoppers—dedicated customers',
  };
  return contexts[hour] || 'at peak shopping time';
}

