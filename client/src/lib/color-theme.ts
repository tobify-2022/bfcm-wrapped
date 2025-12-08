/**
 * Color Theme System
 * Standardized color usage throughout the BFCM Wrapped report
 */

export const ColorTheme = {
  // Primary Metric Colors
  gmv: {
    text: 'text-pink-400',
    textBold: 'text-pink-400',
    bg: 'bg-pink-500/20',
    bgGradient: 'from-pink-500/20 to-purple-500/20',
    border: 'border-pink-500/30',
    borderStrong: 'border-pink-500/30',
    accent: 'text-pink-400',
  },
  orders: {
    text: 'text-cyan-400',
    textBold: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
    borderStrong: 'border-cyan-500/30',
    accent: 'text-cyan-400',
  },
  aov: {
    text: 'text-purple-400',
    textBold: 'text-purple-400',
    bg: 'bg-purple-500/20',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    borderStrong: 'border-purple-500/30',
    accent: 'text-purple-400',
  },
  
  // Status Colors
  growth: {
    text: 'text-cyan-400',
    textBold: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
  },
  decline: {
    text: 'text-red-400',
    textBold: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
  },
  
  // Platform/Shopify Colors
  platform: {
    text: 'text-blue-400',
    textBold: 'text-blue-400',
    bg: 'bg-blue-500/20',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
  },
  
  // Ecosystem Colors
  shopPay: {
    text: 'text-cyan-400',
    textBold: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
    accent: 'text-cyan-300',
  },
  omnichannel: {
    text: 'text-purple-400',
    textBold: 'text-purple-400',
    bg: 'bg-purple-500/20',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
  },
  
  // International/Global Colors
  international: {
    text: 'text-cyan-400',
    textBold: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
  },
  
  // Achievement Colors
  achievement: {
    text: 'text-amber-400',
    textBold: 'text-amber-400',
    bg: 'bg-amber-500/20',
    bgGradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
  },
  
  // Discount Colors
  discount: {
    text: 'text-amber-400',
    textBold: 'text-amber-400',
    bg: 'bg-amber-500/20',
    bgGradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/30',
  },
  
  // Customer Colors
  customer: {
    new: {
      text: 'text-pink-400',
      bg: 'bg-pink-500/20',
    },
    returning: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
    },
  },
  
  // Channel Colors
  channel: {
    online: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
    },
    pos: {
      text: 'text-purple-400',
      bg: 'bg-purple-500/20',
    },
    shop: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    b2b: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/20',
    },
  },
  
  // Headings
  heading: {
    gradient: 'bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent',
    text: 'text-white',
  },
  
  // Backgrounds
  background: {
    main: 'bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900/50',
    card: 'bg-gradient-to-br from-slate-800/50 to-blue-900/50',
    section: 'bg-gradient-to-br from-slate-800/50 to-blue-900/50',
  },
  
  // Borders
  border: {
    default: 'border-cyan-500/20',
    strong: 'border-cyan-500/30',
    accent: 'border-pink-500/30',
  },
  
  // Recharts Color Palette (Shopify-Wrapped inspired)
  charts: {
    colors: ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'],
    purple: '#667eea',
    indigo: '#764ba2',
    amber: '#f59e0b',
    emerald: '#10b981',
    pink: '#ec4899',
    violet: '#8b5cf6',
  },
} as const;

/**
 * Get color classes for a metric type
 */
export function getMetricColors(metricType: 'gmv' | 'orders' | 'aov') {
  return ColorTheme[metricType];
}

/**
 * Get color classes for growth/decline
 */
export function getGrowthColors(isPositive: boolean) {
  return isPositive ? ColorTheme.growth : ColorTheme.decline;
}

/**
 * Get color classes for a channel type
 */
export function getChannelColors(channelType: string) {
  const normalized = channelType.toLowerCase();
  if (normalized.includes('online') || normalized.includes('web')) {
    return ColorTheme.channel.online;
  }
  if (normalized.includes('pos') || normalized.includes('retail')) {
    return ColorTheme.channel.pos;
  }
  if (normalized.includes('shop')) {
    return ColorTheme.channel.shop;
  }
  if (normalized.includes('b2b')) {
    return ColorTheme.channel.b2b;
  }
  return ColorTheme.channel.online; // Default
}

