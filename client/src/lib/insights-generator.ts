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

// Helper function for currency formatting
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

