/**
 * Dynamic Insights Generator
 * 
 * Generates contextual, data-driven insights for merchant reports
 * based on performance metrics and industry benchmarks.
 */

/**
 * Generate growth trajectory insight based on YoY growth percentage
 */
export function getGrowthInsight(yoyGrowth: number, comparisonLabel: string = 'YoY'): string {
  if (yoyGrowth > 30) {
    return `Exceptional ${comparisonLabel} growth trajectory of ${yoyGrowth.toFixed(1)}% outpacing the top 5% of merchants in your category.`;
  }
  if (yoyGrowth > 20) {
    return `Outstanding ${comparisonLabel} growth of ${yoyGrowth.toFixed(1)}% places you in the top 10% of merchants globally.`;
  }
  if (yoyGrowth > 10) {
    return `Strong ${comparisonLabel} momentum of ${yoyGrowth.toFixed(1)}% demonstrates solid market positioning and customer demand.`;
  }
  if (yoyGrowth > 0) {
    return `Steady positive ${comparisonLabel} growth of ${yoyGrowth.toFixed(1)}% in a challenging macroeconomic environment.`;
  }
  if (yoyGrowth > -10) {
    return `Consolidating market position while optimizing for operational efficiency and profitability.`;
  }
  return `Strategic reset period—ideal time to refine positioning, optimize operations, and prepare for renewed growth.`;
}

/**
 * Generate conversion funnel insight based on conversion rate
 */
export function getFunnelInsight(conversionRate: number): string {
  if (conversionRate > 3.5) {
    return `Your ${conversionRate.toFixed(1)}% conversion rate is exceptional—well above the 2.5% industry standard and in the top tier globally.`;
  }
  if (conversionRate > 2.5) {
    return `Your checkout optimization is delivering strong results with a ${conversionRate.toFixed(1)}% conversion rate above industry average.`;
  }
  if (conversionRate > 1.5) {
    return `Your ${conversionRate.toFixed(1)}% conversion rate indicates solid intent capture with opportunity to optimize checkout flow.`;
  }
  return `Conversion rate optimization presents a significant opportunity—small improvements here can dramatically impact revenue.`;
}

/**
 * Generate customer loyalty insight based on repeat customer rate
 */
export function getLoyaltyInsight(repeatCustomerRate: number): string {
  if (repeatCustomerRate > 40) {
    return `A ${repeatCustomerRate.toFixed(1)}% repeat rate signals exceptional brand loyalty and strong customer lifetime value.`;
  }
  if (repeatCustomerRate > 30) {
    return `Your ${repeatCustomerRate.toFixed(1)}% repeat customer rate demonstrates a highly engaged, loyal customer base driving sustainable LTV.`;
  }
  if (repeatCustomerRate > 20) {
    return `With ${repeatCustomerRate.toFixed(1)}% of customers returning, you've built solid loyalty—continuing to nurture this will amplify LTV.`;
  }
  return `Focusing on retention strategies could unlock significant LTV growth, as new customer acquisition remains your primary revenue driver.`;
}

/**
 * Generate channel dominance insight
 */
export function getChannelInsight(channelName: string, percentage: number): string {
  if (percentage > 60) {
    return `Your ${channelName} channel is highly dominant at ${percentage.toFixed(1)}%—consider diversifying to reduce channel concentration risk.`;
  }
  if (percentage > 40) {
    return `${channelName} drives ${percentage.toFixed(1)}% of revenue, demonstrating strong channel market fit and customer preference.`;
  }
  if (percentage > 25) {
    return `${channelName} contributes ${percentage.toFixed(1)}% of total revenue, showing healthy channel diversification.`;
  }
  return `${channelName} represents ${percentage.toFixed(1)}% of revenue—explore opportunities to grow this channel's contribution.`;
}

/**
 * Generate retail performance insight
 */
export function getRetailInsight(retailPercentage: number, locationCount: number): string {
  if (locationCount === 0) {
    return `Pure digital commerce model—consider exploring physical retail or pop-up experiences to build brand presence.`;
  }
  if (retailPercentage > 40) {
    return `Strong omnichannel presence with ${retailPercentage.toFixed(1)}% retail GMV across ${locationCount} location${locationCount > 1 ? 's' : ''}.`;
  }
  if (retailPercentage > 20) {
    return `Growing retail footprint contributing ${retailPercentage.toFixed(1)}% of GMV across ${locationCount} location${locationCount > 1 ? 's' : ''}.`;
  }
  return `Emerging retail channel at ${retailPercentage.toFixed(1)}% of GMV—opportunity to expand physical presence.`;
}

/**
 * Generate AOV insight
 */
export function getAOVInsight(aov: number, industryAverage: number = 75): string {
  const percentDiff = ((aov - industryAverage) / industryAverage) * 100;
  
  if (percentDiff > 50) {
    return `Exceptional ${formatCurrency(aov)} AOV indicates premium positioning and strong value perception.`;
  }
  if (percentDiff > 20) {
    return `Strong ${formatCurrency(aov)} AOV demonstrates effective upselling and product mix optimization.`;
  }
  if (percentDiff > 0) {
    return `Your ${formatCurrency(aov)} AOV is solid—consider bundles or Shop Pay Installments to drive further growth.`;
  }
  return `${formatCurrency(aov)} AOV presents opportunity—product bundling and cross-sells could significantly boost this metric.`;
}

/**
 * Generate product performance insight
 */
export function getProductInsight(topProductShare: number, productCount: number): string {
  if (topProductShare > 50) {
    return `Your top product drives ${topProductShare.toFixed(1)}% of sales—consider diversifying to reduce dependency on a single SKU.`;
  }
  if (topProductShare > 30) {
    return `Strong hero product at ${topProductShare.toFixed(1)}% of sales with healthy catalog depth across ${productCount} top performers.`;
  }
  return `Balanced product portfolio with no single SKU dominating—indicates healthy catalog diversity.`;
}

/**
 * Generate mobile commerce insight
 */
export function getMobileInsight(mobilePercentage: number): string {
  if (mobilePercentage > 70) {
    return `${mobilePercentage.toFixed(1)}% mobile traffic—your mobile experience is critical. Ensure fast loading and seamless checkout.`;
  }
  if (mobilePercentage > 50) {
    return `Mobile-first audience at ${mobilePercentage.toFixed(1)}%—Shop Pay and mobile optimization are key growth levers.`;
  }
  return `Desktop remains strong at ${(100 - mobilePercentage).toFixed(1)}%—balanced approach to mobile and desktop optimization needed.`;
}

/**
 * Generate international expansion insight
 */
export function getInternationalInsight(crossBorderPercentage: number, topMarkets: number): string {
  if (crossBorderPercentage > 40) {
    return `Significant ${crossBorderPercentage.toFixed(1)}% cross-border business across ${topMarkets} markets—Shopify Markets Pro could streamline operations.`;
  }
  if (crossBorderPercentage > 20) {
    return `Growing international presence at ${crossBorderPercentage.toFixed(1)}%—strong foundation for further global expansion.`;
  }
  if (crossBorderPercentage > 5) {
    return `Emerging international opportunity at ${crossBorderPercentage.toFixed(1)}%—test and scale in high-potential markets.`;
  }
  return `Primarily domestic market—international expansion represents a significant untapped growth opportunity.`;
}

// OLD DUPLICATE FUNCTIONS REMOVED - keeping only updated versions below

// Helper function for currency formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Industry Benchmarks for comparison
 */
export const INDUSTRY_BENCHMARKS = {
  averageConversionRate: 2.5,
  averageAOV: 75,
  averageRepeatRate: 28,
  averageMobileSessionPct: 65,
  averageCartAbandonmentRate: 70,
  averageShopPayAdoption: 32,
  topTierConversionRate: 3.5,
  topTierRepeatRate: 40,
} as const;

/**
 * Generate product mix insight
 */
export function getProductMixInsight(topProductShare: number, productCount: number): string {
  if (topProductShare > 50) {
    return `Your top product drives ${topProductShare.toFixed(1)}% of sales—consider diversifying to reduce dependency on a single SKU and protect against inventory or trend risks.`;
  }
  if (topProductShare > 30) {
    return `Strong hero product at ${topProductShare.toFixed(1)}% of sales with healthy catalog depth across ${productCount} top performers. This balance supports sustainable growth.`;
  }
  return `Balanced product portfolio with no single SKU dominating (top product: ${topProductShare.toFixed(1)}%)—indicates healthy catalog diversity and reduced concentration risk.`;
}

/**
 * Generate discount strategy insight
 */
export function getDiscountStrategyInsight(discountedSalesPct: number, totalDiscountedSales: number): string {
  if (discountedSalesPct > 60) {
    return `${discountedSalesPct.toFixed(1)}% of sales came from discounted products—while effective for conversion, evaluate impact on brand perception and margin health.`;
  }
  if (discountedSalesPct > 40) {
    return `Balanced discount strategy with ${discountedSalesPct.toFixed(1)}% of GMV from promotions (${formatCurrency(totalDiscountedSales)}). This maintains healthy mix of full-price and promotional sales.`;
  }
  if (discountedSalesPct > 20) {
    return `Conservative discount approach with ${discountedSalesPct.toFixed(1)}% promotional sales—strong brand value perception with opportunity to test strategic promotions for volume growth.`;
  }
  return `Minimal discounting strategy (${discountedSalesPct.toFixed(1)}%)—indicates premium positioning or opportunity to test promotions for customer acquisition.`;
}

/**
 * Generate checkout optimization insight
 */
export function getCheckoutOptimizationInsight(
  addToCartRate: number,
  cartToCheckoutRate: number,
  checkoutCompletionRate: number
): string {
  if (addToCartRate < 20) {
    return `Only ${addToCartRate.toFixed(1)}% of sessions add to cart—primary opportunity is driving product engagement and purchase intent through improved merchandising and social proof.`;
  }
  if (cartToCheckoutRate < 50) {
    return `${cartToCheckoutRate.toFixed(1)}% cart-to-checkout rate indicates significant drop-off—optimize with trust signals, shipping transparency, and Shop Pay for faster checkout.`;
  }
  if (checkoutCompletionRate < 70) {
    return `${checkoutCompletionRate.toFixed(1)}% checkout completion—reduce friction with Shop Pay (converts 1.91x better), clear shipping costs, and mobile-optimized forms.`;
  }
  return `Strong checkout flow with ${checkoutCompletionRate.toFixed(1)}% completion rate—continue optimizing with address autofill and payment method expansion.`;
}

/**
 * Generate seasonality insight
 */
export function getSeasonalityInsight(peakDay: string, peakHour: string | null): string {
  if (peakHour) {
    return `Peak traffic occurred on ${peakDay} at ${peakHour}—use these insights to time future promotions, email campaigns, and ensure inventory availability during high-intent periods.`;
  }
  return `Highest performance on ${peakDay}—plan inventory, staffing, and marketing campaigns around these peak periods for maximum impact.`;
}

/**
 * Benchmark comparison insight
 */
export function getBenchmarkInsight(
  metricValue: number,
  benchmarkValue: number,
  metricName: string,
  higherIsBetter: boolean = true
): string {
  const difference = ((metricValue - benchmarkValue) / benchmarkValue) * 100;
  const absDiff = Math.abs(difference);
  
  if (higherIsBetter) {
    if (difference > 20) {
      return `Your ${metricValue.toFixed(1)}% ${metricName} exceeds the ${benchmarkValue}% industry average by ${absDiff.toFixed(0)}%—placing you in the top performer category.`;
    }
    if (difference > 0) {
      return `Your ${metricValue.toFixed(1)}% ${metricName} is above the ${benchmarkValue}% industry benchmark—continue optimizing to reach top-tier performance.`;
    }
    return `Your ${metricValue.toFixed(1)}% ${metricName} is below the ${benchmarkValue}% industry standard—this represents a high-priority optimization opportunity.`;
  } else {
    if (difference < -20) {
      return `Your ${metricValue.toFixed(1)}% ${metricName} is ${absDiff.toFixed(0)}% better than the ${benchmarkValue}% industry average.`;
    }
    if (difference < 0) {
      return `Your ${metricValue.toFixed(1)}% ${metricName} outperforms the ${benchmarkValue}% benchmark.`;
    }
    return `Your ${metricValue.toFixed(1)}% ${metricName} exceeds the ${benchmarkValue}% industry standard—opportunity to optimize.`;
  }
}

/**
 * Recommendation System
 */
export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'growth' | 'optimization' | 'risk';
  title: string;
  description: string;
  potentialImpact: string;
  shopifyProduct?: string;
}

/**
 * Generate strategic recommendations based on data
 */
export function generateRecommendations(
  conversionRate: number,
  repeatRate: number,
  mobileSessionPct: number,
  shopPayPct: number | undefined,
  crossBorderPct: number,
  discountedSalesPct: number,
  retailGMV: number,
  yoyGrowth: number
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Conversion optimization
  if (conversionRate < INDUSTRY_BENCHMARKS.averageConversionRate) {
    recommendations.push({
      priority: 'high',
      category: 'optimization',
      title: 'Optimize Conversion Rate',
      description: `Your ${conversionRate.toFixed(1)}% CR is below industry average. Implement Shop Pay for 1.91x better conversion, add trust signals, optimize product pages, and streamline checkout.`,
      potentialImpact: `Reaching ${INDUSTRY_BENCHMARKS.averageConversionRate}% CR could add significant revenue`,
      shopifyProduct: 'Shop Pay'
    });
  }
  
  // Shop Pay adoption
  if (!shopPayPct || shopPayPct < INDUSTRY_BENCHMARKS.averageShopPayAdoption) {
    recommendations.push({
      priority: 'high',
      category: 'growth',
      title: 'Accelerate Shop Pay Adoption',
      description: `Shop Pay adoption is ${shopPayPct ? 'at ' + shopPayPct.toFixed(1) + '%' : 'low'}. Increase prominence at checkout—Shop Pay converts 1.91x better than guest checkout.`,
      potentialImpact: 'Could improve conversion rate by up to 50%',
      shopifyProduct: 'Shop Pay'
    });
  }
  
  // Customer retention
  if (repeatRate < INDUSTRY_BENCHMARKS.averageRepeatRate) {
    recommendations.push({
      priority: 'high',
      category: 'growth',
      title: 'Build Customer Loyalty Program',
      description: `${repeatRate.toFixed(1)}% repeat rate is below benchmark. Implement post-purchase email flows, loyalty rewards, and personalized recommendations to increase LTV.`,
      potentialImpact: 'Increasing repeat rate by 10% can double customer LTV',
      shopifyProduct: 'Shopify Email + Flow'
    });
  }
  
  // Mobile optimization
  if (mobileSessionPct > 60 && conversionRate < 2.5) {
    recommendations.push({
      priority: 'high',
      category: 'optimization',
      title: 'Mobile Experience Optimization',
      description: `${mobileSessionPct.toFixed(1)}% of traffic is mobile. Prioritize mobile-first design, faster load times, thumb-friendly CTAs, and Shop Pay for seamless mobile checkout.`,
      potentialImpact: 'Mobile CR improvements directly impact majority of traffic',
      shopifyProduct: 'Shop Pay + Mobile Optimization'
    });
  }
  
  // International expansion
  if (crossBorderPct > 5 && crossBorderPct < 30) {
    recommendations.push({
      priority: 'medium',
      category: 'growth',
      title: 'Scale International Sales',
      description: `${crossBorderPct.toFixed(1)}% cross-border business shows global demand. Consider Shopify Markets for localized pricing, duties/taxes, and local payment methods.`,
      potentialImpact: 'Markets merchants see 23% increase in international conversion',
      shopifyProduct: 'Shopify Markets'
    });
  }
  
  // Retail expansion
  if (retailGMV > 0 && retailGMV < 1000000) {
    recommendations.push({
      priority: 'medium',
      category: 'growth',
      title: 'Expand Retail Presence',
      description: `Growing retail footprint (${formatCurrency(retailGMV)}) shows omnichannel opportunity. Scale with POS Pro for unified inventory, customer profiles, and reporting.`,
      potentialImpact: 'Omnichannel customers spend 3x more on average',
      shopifyProduct: 'POS Pro'
    });
  }
  
  // Discount strategy
  if (discountedSalesPct > 60) {
    recommendations.push({
      priority: 'medium',
      category: 'risk',
      title: 'Optimize Discount Strategy',
      description: `${discountedSalesPct.toFixed(1)}% promotional sales may impact margins and brand perception. Test tiered discounts, bundle offers, and gift-with-purchase to maintain value perception.`,
      potentialImpact: 'Reducing discount dependency by 10% preserves margin',
    });
  }
  
  // Growth momentum
  if (yoyGrowth > 30) {
    recommendations.push({
      priority: 'high',
      category: 'growth',
      title: 'Capitalize on Growth Momentum',
      description: `${yoyGrowth.toFixed(1)}% YoY growth is exceptional. Scale with Shopify Plus for advanced automation, B2B capabilities, and enterprise features to support continued expansion.`,
      potentialImpact: 'Plus merchants grow 2x faster on average',
      shopifyProduct: 'Shopify Plus'
    });
  }
  
  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations.slice(0, 8); // Top 8 recommendations
}

