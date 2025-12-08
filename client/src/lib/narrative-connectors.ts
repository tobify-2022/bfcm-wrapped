/**
 * Narrative Connectors
 * 
 * Generate contextual transitions between report sections
 * to create a cohesive data story
 */

import { DerivedMetrics } from './report-data-transforms';

export interface NarrativeTransition {
  text: string;
  tone: 'positive' | 'neutral' | 'concern';
}

/**
 * Get transition from metrics to drivers section
 */
export function getMetricsTransition(derivedMetrics: DerivedMetrics): NarrativeTransition {
  const { yoyGMVChangePct, isGrowing } = derivedMetrics;
  
  if (yoyGMVChangePct > 30) {
    return {
      text: "Now that we've seen your exceptional growth, let's understand what drove this success...",
      tone: 'positive'
    };
  }
  
  if (isGrowing) {
    return {
      text: "With solid momentum established, let's explore the key drivers behind your performance...",
      tone: 'positive'
    };
  }
  
  return {
    text: "To uncover optimization opportunities, let's analyze your performance drivers...",
    tone: 'neutral'
  };
}

/**
 * Get transition to customer section
 */
export function getCustomerTransition(derivedMetrics: DerivedMetrics): NarrativeTransition {
  const { repeatCustomerRate } = derivedMetrics;
  
  if (repeatCustomerRate > 40) {
    return {
      text: "Your strong performance is powered by a loyal customer base. Let's dive into who's shopping with you...",
      tone: 'positive'
    };
  }
  
  if (repeatCustomerRate > 25) {
    return {
      text: "Understanding your customer mix reveals opportunities to build even stronger relationships...",
      tone: 'neutral'
    };
  }
  
  return {
    text: "Building customer loyalty is a key opportunity. Let's see who's currently shopping with you...",
    tone: 'concern'
  };
}

/**
 * Get transition to recommendations section
 */
export function getRecommendationsTransition(derivedMetrics: DerivedMetrics): NarrativeTransition {
  const { performanceGrade } = derivedMetrics;
  
  if (performanceGrade === 'A') {
    return {
      text: "You're firing on all cylinders. Here's how to maintain momentum and explore new growth vectors...",
      tone: 'positive'
    };
  }
  
  if (performanceGrade === 'B' || performanceGrade === 'C') {
    return {
      text: "Based on your performance analysis, here are high-impact opportunities to accelerate growth...",
      tone: 'neutral'
    };
  }
  
  return {
    text: "Let's turn insights into action. Here are strategic priorities to unlock your growth potential...",
    tone: 'concern'
  };
}

/**
 * Get styling classes for transition tone
 */
export function getTransitionStyles(tone: 'positive' | 'neutral' | 'concern'): string {
  switch (tone) {
    case 'positive':
      return 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-100';
    case 'concern':
      return 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-100';
    default:
      return 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-100';
  }
}

/**
 * Generate section-specific intro text
 */
export function getChannelIntro(dominantChannel: { name: string; percentage: number } | null): string {
  if (!dominantChannel) {
    return "Let's explore how sales are distributed across your channels...";
  }
  
  if (dominantChannel.percentage > 70) {
    return `Your ${dominantChannel.name} channel dominates at ${dominantChannel.percentage.toFixed(0)}% of sales. Let's see the full channel mix...`;
  }
  
  return `Your ${dominantChannel.name} channel leads at ${dominantChannel.percentage.toFixed(0)}%, but you maintain a healthy channel mix...`;
}

export function getProductIntro(topProductShare: number): string {
  if (topProductShare > 50) {
    return "Your product portfolio has a clear hero. Let's see what customers love most...";
  }
  
  if (topProductShare > 30) {
    return "A strong hero product leads a diverse catalog. Here's what sold best...";
  }
  
  return "Your balanced product mix shows no single SKU dominates. Here are your top performers...";
}

export function getConversionIntro(conversionRate: number): string {
  if (conversionRate > 3.5) {
    return "Your checkout flow is world-class. Let's break down the conversion journey...";
  }
  
  if (conversionRate > 2.5) {
    return "Your conversion funnel performs above industry standard. Here's the breakdown...";
  }
  
  return "Understanding your funnel reveals optimization opportunities. Let's analyze the journey...";
}
