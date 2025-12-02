import { ReportData } from '@/pages/Home';
import { Download, Info } from 'lucide-react';
import { generatePDF } from '@/lib/pdf-generator';
import { useState, useEffect } from 'react';
import { detectCommercePersonality } from '@/lib/commerce-personality';
import { calculateBadges } from '@/lib/badges';
import { 
  getGMVContext, 
  getPeakGMVContext, 
  getCustomerContext, 
  getTopCustomerContext,
  getInternationalContext
} from '@/lib/contextual-copy';
import Badge from './Badge';
import Confetti from './Confetti';
import AnimatedSection from './AnimatedSection';

interface ReportPreviewProps {
  data: ReportData;
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const [hoveredQuery, setHoveredQuery] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti on mount if there's significant growth
  useEffect(() => {
    const yoyGMVChange = data.metrics2024.total_gmv > 0
      ? ((data.metrics2025.total_gmv - data.metrics2024.total_gmv) / data.metrics2024.total_gmv) * 100
      : 0;
    
    if (yoyGMVChange > 50 || data.metrics2024.total_gmv === 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [data]);

  const handleDownloadPDF = () => {
    generatePDF(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleQueryHover = (queryKey: string, event: React.MouseEvent) => {
    const query = data.queries[queryKey as keyof typeof data.queries];
    if (query) {
      setHoveredQuery(query.query);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleQueryLeave = () => {
    setHoveredQuery(null);
    setTooltipPosition(null);
  };

  const QueryTooltip = ({ queryKey, children }: { queryKey: string; children: React.ReactNode }) => {
    const query = data.queries?.[queryKey as keyof typeof data.queries];
    if (!query) return <>{children}</>;

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={(e) => handleQueryHover(queryKey, e)}
          onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
          onMouseLeave={handleQueryLeave}
          className="inline-flex items-center gap-1 cursor-help group"
        >
          {children}
          <Info className="w-3 h-3 text-gray-400 group-hover:text-shopify-green transition-colors" />
        </div>
        {hoveredQuery === query.query && tooltipPosition && (
          <div
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-4 max-w-2xl max-h-96 overflow-auto font-mono shadow-xl border border-gray-700 pointer-events-auto"
            style={{
              left: `${Math.min(tooltipPosition.x + 10, window.innerWidth - 600)}px`,
              top: `${Math.min(tooltipPosition.y + 10, window.innerHeight - 400)}px`,
            }}
            onMouseEnter={() => {}} // Keep tooltip visible when hovering over it
            onMouseLeave={handleQueryLeave}
          >
            <div className="text-yellow-400 mb-2 font-sans font-semibold text-sm">{query.label}</div>
            <pre className="whitespace-pre-wrap break-words text-gray-100 text-xs leading-relaxed">
              {query.query}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const yoyGMVChange = data.metrics2024.total_gmv > 0
    ? ((data.metrics2025.total_gmv - data.metrics2024.total_gmv) / data.metrics2024.total_gmv) * 100
    : 0;

  const yoyOrdersChange = data.metrics2024.total_orders > 0
    ? ((data.metrics2025.total_orders - data.metrics2024.total_orders) / data.metrics2024.total_orders) * 100
    : 0;

  const yoyAOVChange = data.metrics2024.aov > 0
    ? ((data.metrics2025.aov - data.metrics2024.aov) / data.metrics2024.aov) * 100
    : 0;

  // Find biggest channel growth
  const biggestChannelGrowth = data.channelPerformance.length > 0
    ? data.channelPerformance.reduce((max, channel) => 
        channel.yoy_growth_pct > max.yoy_growth_pct ? channel : max
      )
    : null;

  // Calculate badges and personalities
  const badges = calculateBadges(data);
  const personalities = detectCommercePersonality(data);

  // Check if we have meaningful data
  const hasData = data.metrics2025.total_gmv > 0 || data.metrics2025.total_orders > 0;
  
  // Check if dates are in the future
  const isFutureDate = new Date(data.startDate) > new Date();
  
  if (!hasData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-yellow-900 mb-2">
            No Data Available
          </h3>
          <p className="text-yellow-800 mb-4">
            No orders or GMV found for {data.accountName} during the selected period.
          </p>
          {data.shopIds.length > 1 && (
            <p className="text-sm text-yellow-700 mb-2">
              Reporting for {data.shopIds.length} shops: {data.shopIds.join(', ')}
            </p>
          )}
          <p className="text-sm text-yellow-700 mb-4">
            Period: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
          </p>
          {isFutureDate && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Tip:</p>
              <p className="text-sm text-blue-800">
                The selected date range is in the future. To test with actual data, try using BFCM 2024 dates (Nov 28 - Dec 1, 2024) using the "Use BFCM 2024 dates" button in the form above.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative">
      <Confetti trigger={showConfetti} />
      <div className="mb-6 flex justify-between items-center">
        <div>
        <h2 className="text-2xl font-bold text-shopify-dark-green">
            {data.accountName}
        </h2>
          {data.shopIds.length > 1 && (
            <p className="text-sm text-gray-600 mt-1">
              Reporting for {data.shopIds.length} shops
            </p>
          )}
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-gradient-to-r from-shopify-blue to-shopify-green text-white px-6 py-3 rounded-full hover:shadow-lg transition-all font-semibold"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div id="report-content" className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Hero Section - Spotify Wrapped Style */}
        <div className="bg-gradient-to-br from-shopify-green via-shopify-blue to-purple-600 text-white p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="text-6xl mb-4">🎁</div>
            <h1 className="text-5xl font-bold mb-3">
              Your Year, Wrapped in Commerce
          </h1>
            <p className="text-2xl font-light mb-2 opacity-90">
            {data.accountName}
          </p>
            <p className="text-lg opacity-75">
              BFCM 2025 • {new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Badges Section */}
          {badges.length > 0 && (
            <AnimatedSection delay={200}>
              <div className="mb-12">
              <h2 className="text-3xl font-bold text-shopify-dark-green mb-6 text-center">
                Your Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <Badge key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
            </AnimatedSection>
          )}

          {/* Commerce Personality */}
          {personalities.length > 0 && (
            <AnimatedSection delay={400}>
              <div className="mb-12">
              <h2 className="text-3xl font-bold text-shopify-dark-green mb-6 text-center">
                Your Commerce Personality
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalities.map((personality, index) => (
                  <div 
                    key={index}
                    className={`bg-gradient-to-br ${personality.color} rounded-2xl p-8 text-white shadow-lg`}
                  >
                    <div className="text-6xl mb-4">{personality.emoji}</div>
                    <div className="text-2xl font-bold mb-2">{personality.title}</div>
                    <div className="text-lg opacity-90">{personality.description}</div>
                  </div>
                ))}
              </div>
            </div>
            </AnimatedSection>
          )}

          {/* Your BFCM 2025 by the Numbers */}
          <AnimatedSection delay={600}>
            <div className="mb-12">
            <h2 className="text-3xl font-bold text-shopify-dark-green mb-6 text-center">
              Your BFCM 2025 by the Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-shopify-green/10 to-shopify-green/5 rounded-2xl p-8 border-2 border-shopify-green/20">
                <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Total Sales</div>
                <div className="text-4xl font-bold text-shopify-green mb-3">
                  {formatCurrency(data.metrics2025.total_gmv)}
                </div>
                {data.metrics2024.total_gmv > 0 && (
                  <div className={`text-lg font-semibold ${yoyGMVChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(yoyGMVChange)} vs 2024
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-3 italic">
                  {getGMVContext(data.metrics2025.total_gmv)}
                </div>
              </div>

              <div className="bg-gradient-to-br from-shopify-blue/10 to-shopify-blue/5 rounded-2xl p-8 border-2 border-shopify-blue/20">
                <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Total Orders</div>
                <div className="text-4xl font-bold text-shopify-blue mb-3">
                  {data.metrics2025.total_orders.toLocaleString()}
                </div>
                {data.metrics2024.total_orders > 0 && (
                  <div className={`text-lg font-semibold ${yoyOrdersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(yoyOrdersChange)} vs 2024
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-3">
                  Orders fulfilled
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-8 border-2 border-purple-500/20">
                <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Average Order Value</div>
                <div className="text-4xl font-bold text-purple-600 mb-3">
                  {formatCurrency(data.metrics2025.aov)}
                </div>
                {data.metrics2024.aov > 0 && (
                  <div className={`text-lg font-semibold ${yoyAOVChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(yoyAOVChange)} vs 2024
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-3">
                  Per order
                </div>
              </div>
            </div>
          </div>
          </AnimatedSection>

          {/* Shopify BFCM Stats (High Level) */}
          {data.shopifyBFCMStats ? (
            <div className="mb-12 p-8 bg-gradient-to-br from-shopify-green/10 to-shopify-blue/10 rounded-2xl border-2 border-shopify-green/20">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <h2 className="text-2xl font-semibold text-shopify-dark-green">
                  Shopify BFCM 2025 (Platform-Wide)
          </h2>
                <QueryTooltip queryKey="shopifyBFCMStats">
                  <span></span>
                </QueryTooltip>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                  <div className="text-2xl font-bold text-shopify-green">
                    {formatCurrency(data.shopifyBFCMStats.total_gmv_processed)}
                  </div>
              <div className="text-sm text-muted-foreground">Total GMV Processed</div>
            </div>
            <div>
                  <div className="text-2xl font-bold text-shopify-green">
                    {formatCurrency(data.shopifyBFCMStats.peak_gmv_per_minute)}
                  </div>
              <div className="text-sm text-muted-foreground">Peak GMV per Minute</div>
            </div>
            <div>
                  <div className="text-2xl font-bold text-shopify-green">
                    {data.shopifyBFCMStats.total_orders.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-shopify-green">
                    {data.shopifyBFCMStats.total_shops.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Shops</div>
            </div>
          </div>
        </div>
          ) : (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold mb-2 text-shopify-dark-green">
                Shopify BFCM 2025 Stats
          </h2>
              <p className="text-sm text-muted-foreground">
                Platform-wide stats require special permissions. Showing merchant-specific data below.
              </p>
            </div>
          )}

          {/* Peak Performance - Enhanced */}
          {data.peakGMV && (
            <AnimatedSection delay={800}>
              <div className="mb-12 p-8 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-2xl border-2 border-yellow-400/30">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold text-shopify-dark-green">
                    ⚡ Your Peak Moment
                  </h3>
                  <QueryTooltip queryKey="peakGMV">
                    <span></span>
                  </QueryTooltip>
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                  {formatCurrency(data.peakGMV.peak_gmv_per_minute)} per minute
                </div>
                <div className="text-lg text-muted-foreground mb-2">
                  {new Date(data.peakGMV.peak_minute).toLocaleString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-base font-medium text-shopify-dark-green italic">
                  {getPeakGMVContext(data.peakGMV.peak_gmv_per_minute, data.peakGMV.peak_minute)}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Your Customer Story */}
          {data.customerInsights.top_customer_spend > 0 && (
            <AnimatedSection delay={1000}>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-shopify-dark-green mb-6 text-center">
                Your Customer Story
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 border-2 border-indigo-500/20">
                  <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Top Customer</div>
                  <div className="text-2xl font-bold text-indigo-700 mb-2">
                    {formatCurrency(data.customerInsights.top_customer_spend)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getTopCustomerContext(data)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl p-8 border-2 border-pink-500/20">
                  <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Customer Mix</div>
                  <div className="text-2xl font-bold text-pink-700 mb-2">
                    {data.customerInsights.new_customers.toLocaleString()} new
                  </div>
                  <div className="text-xl font-semibold text-rose-600 mb-2">
                    {data.customerInsights.returning_customers.toLocaleString()} returning
                  </div>
                  <div className="text-sm text-muted-foreground italic">
                    {getCustomerContext(data)}
                  </div>
                </div>
              </div>
            </div>
            </AnimatedSection>
          )}

        {/* Retail Metrics */}
        {data.retailMetrics.retail_orders > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold text-shopify-dark-green">
                📍 Retail Performance
              </h2>
              <QueryTooltip queryKey="retailMetrics">
                <span></span>
              </QueryTooltip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-muted-foreground mb-1">Top Retail Location</div>
                <div className="text-xl font-bold text-purple-700">
                  {data.retailMetrics.top_location || 'N/A'}
                </div>
              </div>
              <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-muted-foreground mb-1">Total Retail GMV</div>
                <div className="text-xl font-bold text-purple-700">
                  {formatCurrency(data.retailMetrics.retail_gmv)}
                </div>
              </div>
              <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-muted-foreground mb-1">Retail AOV</div>
                <div className="text-xl font-bold text-purple-700">
                  {formatCurrency(data.retailMetrics.retail_aov)}
                </div>
              </div>
              <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-sm text-muted-foreground mb-1">Retail UPT (Units Per Transaction)</div>
                <div className="text-xl font-bold text-purple-700">
                  {data.retailMetrics.retail_upt.toFixed(1)}
                </div>
              </div>
            </div>
                </div>
              )}

        {/* Conversion Metrics */}
        {data.conversionMetrics.total_sessions > 0 ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold text-shopify-dark-green">
                📊 Conversion Funnel
              </h2>
              <QueryTooltip queryKey="conversionMetrics">
                <span></span>
              </QueryTooltip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Total Sessions</div>
                <div className="text-2xl font-bold text-blue-700">
                  {data.conversionMetrics.total_sessions.toLocaleString()}
                </div>
              </div>
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                <div className="text-2xl font-bold text-blue-700">
                  {data.conversionMetrics.conversion_rate.toFixed(2)}%
                </div>
              </div>
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Cart → Checkout Rate</div>
                <div className="text-2xl font-bold text-blue-700">
                  {data.conversionMetrics.cart_to_checkout_rate.toFixed(1)}%
                </div>
              </div>
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Mobile vs Desktop</div>
                <div className="text-lg font-semibold text-blue-700">
                  Mobile: {data.conversionMetrics.mobile_sessions.toLocaleString()} | 
                  Desktop: {data.conversionMetrics.desktop_sessions.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-shopify-dark-green">
              📊 Conversion Funnel
            </h3>
            <p className="text-sm text-muted-foreground">
              Session and analytics data not available in accessible BigQuery tables.
            </p>
          </div>
        )}

        {/* Shop Breakdown - Per Store Metrics */}
        {data.shopBreakdown.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold text-shopify-dark-green">
                📊 Performance by Store
              </h2>
              <QueryTooltip queryKey="shopBreakdown">
                <span></span>
              </QueryTooltip>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-shopify-green/20">
                    <th className="text-left p-3 font-semibold text-shopify-dark-green">Shop ID</th>
                    <th className="text-right p-3 font-semibold text-shopify-dark-green">Orders</th>
                    <th className="text-right p-3 font-semibold text-shopify-dark-green">GMV</th>
                    <th className="text-right p-3 font-semibold text-shopify-dark-green">AOV</th>
                    <th className="text-right p-3 font-semibold text-shopify-dark-green">IPT</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shopBreakdown.map((shop) => (
                    <tr key={shop.shop_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{shop.shop_id}</td>
                      <td className="p-3 text-right">{shop.total_orders.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold">{formatCurrency(shop.total_gmv)}</td>
                      <td className="p-3 text-right">{formatCurrency(shop.aov)}</td>
                      <td className="p-3 text-right">{shop.units_per_transaction.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Units Per Transaction */}
        {data.unitsPerTransaction > 0 && (
          <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-shopify-dark-green">
                📦 Units Per Transaction (IPT)
              </h3>
              <QueryTooltip queryKey="unitsPerTransaction">
                <span></span>
              </QueryTooltip>
            </div>
            <div className="text-4xl font-bold text-indigo-700">
              {data.unitsPerTransaction.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Average number of units sold per order
            </div>
          </div>
        )}

        {/* Discount Metrics */}
        {data.discountMetrics.total_discounted_sales > 0 || data.discountMetrics.total_full_price_sales > 0 ? (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold text-shopify-dark-green">
                💰 Discount Performance
              </h2>
              <QueryTooltip queryKey="discountMetrics">
                <span></span>
              </QueryTooltip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-muted-foreground mb-1">Discounted Sales</div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {formatCurrency(data.discountMetrics.total_discounted_sales)}
                </div>
                <div className="text-sm font-medium text-green-600">
                  {data.discountMetrics.discounted_sales_pct.toFixed(1)}% of total sales
                </div>
              </div>
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Full Price Sales</div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {formatCurrency(data.discountMetrics.total_full_price_sales)}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  {data.discountMetrics.full_price_sales_pct.toFixed(1)}% of total sales
                </div>
              </div>
              {data.discountMetrics.total_discount_amount > 0 && (
                <div className="p-5 bg-amber-50 rounded-lg border border-amber-200 col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">Total Discount Amount</div>
                  <div className="text-xl font-bold text-amber-700">
                    {formatCurrency(data.discountMetrics.total_discount_amount)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

          {/* International Sales - Enhanced */}
          {data.internationalSales.top_countries.length > 0 && (
            <AnimatedSection delay={1200}>
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6 justify-center">
                  <h2 className="text-3xl font-bold text-shopify-dark-green">
                    🌍 Your Global Reach
            </h2>
                  <QueryTooltip queryKey="internationalSales">
                    <span></span>
                  </QueryTooltip>
                </div>
              {getInternationalContext(data) && (
                <div className="mb-6 p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border-2 border-blue-500/20 text-center">
                  <div className="text-lg font-semibold text-blue-700">
                    {getInternationalContext(data)}
                  </div>
                </div>
              )}
            {data.internationalSales.cross_border_gmv > 0 ? (
              <div className="mb-4 p-5 bg-teal-50 rounded-lg border border-teal-200">
                <div className="text-sm text-muted-foreground mb-1">Cross-Border GMV</div>
                <div className="text-2xl font-bold text-teal-700">
                  {formatCurrency(data.internationalSales.cross_border_gmv)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {data.internationalSales.cross_border_pct.toFixed(1)}% of total sales
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-2">Top Countries by GMV</h3>
              {data.internationalSales.top_countries.map((country, index) => (
                <div key={country.country} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-shopify-green/20 flex items-center justify-center font-bold text-shopify-green text-xs">
                      {index + 1}
                    </div>
                    <div className="font-medium">{country.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(country.gmv)}</div>
                    <div className="text-xs text-muted-foreground">{country.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </AnimatedSection>
          )}

          {/* Top Products - Enhanced */}
          {data.topProducts.length > 0 ? (
            <AnimatedSection delay={1400}>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <h2 className="text-3xl font-bold text-shopify-dark-green">
                  🏆 Your Best Sellers
            </h2>
                <QueryTooltip queryKey="topProducts">
                  <span></span>
                </QueryTooltip>
              </div>
              {data.topProducts[0] && (
                <div className="mb-6 p-8 bg-gradient-to-br from-amber-400/20 via-yellow-400/20 to-orange-400/20 rounded-2xl border-2 border-amber-400/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-8xl opacity-10">🏆</div>
                  <div className="relative z-10 flex gap-6">
                    {(data.topProducts[0].image_url || data.topProducts[0].product_id) && (
                      <div className="flex-shrink-0">
                        <img 
                          src={data.topProducts[0].image_url || `https://cdn.shopify.com/s/files/1/${data.topProducts[0].product_id}/products/${data.topProducts[0].product_id}_small.jpg`}
                          alt={data.topProducts[0].product_title}
                          className="w-32 h-32 object-cover rounded-xl border-2 border-amber-400/30 shadow-lg"
                          onError={(e) => {
                            // Hide image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-semibold">#1 Best Seller</div>
                      <div className="text-3xl font-bold text-amber-700 mb-2">{data.topProducts[0].product_title}</div>
                      {data.topProducts[0].variant_title && (
                        <div className="text-lg text-amber-600 mb-3">{data.topProducts[0].variant_title}</div>
                      )}
                      <div className="flex items-center gap-6 mb-3">
                        <div className="text-2xl font-bold text-amber-600">
                          {formatCurrency(data.topProducts[0].revenue)}
                        </div>
                        <div className="text-lg font-semibold text-amber-500">
                          {data.topProducts[0].units_sold.toLocaleString()} units moved
                        </div>
                      </div>
                      <div className="text-base text-muted-foreground italic font-medium">
                        ✨ Your customers couldn't get enough of this one!
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {data.topProducts.slice(1, 10).map((product, index) => (
                  <div key={index + 2} className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all">
                    <div className="flex items-center gap-4">
                      {(product.image_url || product.product_id) ? (
                        <img 
                          src={product.image_url || `https://cdn.shopify.com/s/files/1/${product.product_id}/products/${product.product_id}_small.jpg`}
                          alt={product.product_title}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                          onError={(e) => {
                            // Replace with number badge on error
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-16 h-16 rounded-lg bg-gradient-to-br from-shopify-green/20 to-shopify-blue/20 flex items-center justify-center border border-gray-200"><span class="text-2xl font-bold text-shopify-green">${index + 2}</span></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-shopify-green/20 to-shopify-blue/20 flex items-center justify-center border border-gray-200">
                          <span className="text-2xl font-bold text-shopify-green">{index + 2}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-lg">{product.product_title}</div>
                        {product.variant_title && (
                          <div className="text-sm text-muted-foreground">{product.variant_title}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-shopify-green">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-muted-foreground font-medium">{product.units_sold.toLocaleString()} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </AnimatedSection>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-shopify-dark-green">
                🏆 Best Selling Items
              </h3>
              <p className="text-sm text-muted-foreground">
                Product-level data not available. Check BigQuery table access.
              </p>
            </div>
          )}

          {/* Channel Performance - Enhanced */}
          {data.channelPerformance.length > 0 && (
            <AnimatedSection delay={1800}>
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-shopify-dark-green text-center">
                  📈 Sales by Channel
            </h2>
            <div className="space-y-3">
              {data.channelPerformance.map((channel, index) => (
                <div key={index} className="p-5 bg-muted/30 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold text-lg capitalize">{channel.channel_type}</div>
                    <div className={`text-lg font-bold ${channel.yoy_growth_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(channel.yoy_growth_pct)} YoY
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">2025 GMV</div>
                      <div className="font-medium text-lg">{formatCurrency(channel.gmv_2025)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">2025 Orders</div>
                      <div className="font-medium">{channel.orders_2025.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">2024 GMV</div>
                      <div className="font-medium">{formatCurrency(channel.gmv_2024)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">2024 Orders</div>
                      <div className="font-medium">{channel.orders_2024.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
                </div>
                {biggestChannelGrowth && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-muted-foreground mb-1">🚀 Biggest Channel Growth YoY</div>
                    <div className="text-xl font-bold text-green-700 capitalize">
                      {biggestChannelGrowth.channel_type}: {formatPercent(biggestChannelGrowth.yoy_growth_pct)}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Footer - Shopify Branding */}
          <div className="mt-12 pt-8 border-t-2 border-shopify-green/20 text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Generated by Shopify Customer Success
            </div>
            <div className="text-xs text-muted-foreground">
              BFCM Wrapped Report • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
