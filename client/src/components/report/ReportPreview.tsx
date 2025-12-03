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
import { getCountryFlag, formatCountryName } from '@/lib/country-utils';
import { ColorTheme, getMetricColors, getGrowthColors } from '@/lib/color-theme';
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
        <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-lg p-8 text-center backdrop-blur-sm">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-amber-400 mb-2">
            No Data Available
          </h3>
          <p className="text-white/80 mb-4">
            No orders or GMV found for {data.accountName} during the selected period.
          </p>
          {data.shopIds.length > 1 && (
            <p className="text-sm text-white/70 mb-2">
              Reporting for {data.shopIds.length} shops: {data.shopIds.join(', ')}
            </p>
          )}
          <p className="text-sm text-white/70 mb-4">
            Period: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
          </p>
          {isFutureDate && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-md text-left backdrop-blur-sm">
              <p className="text-sm font-medium text-cyan-400 mb-2">💡 Tip:</p>
              <p className="text-sm text-white/80">
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {data.accountName}
        </h2>
          {data.shopIds.length > 1 && (
            <p className="text-sm text-white/70 mt-1">
              Reporting for {data.shopIds.length} shops
            </p>
          )}
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all font-semibold border border-white/20"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div id="report-content" className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden border border-cyan-500/20">
        {/* Hero Section - Shopify BFCM 2025 Style with Globe */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white p-12 text-center relative overflow-hidden border-b-2 border-cyan-500/30">
          {/* Globe Background Image */}
          <div 
            className="absolute inset-0 bg-center bg-cover opacity-25 mix-blend-lighten"
            style={{ 
              backgroundImage: 'url(/assets/globe-connections.jpg)',
              filter: 'brightness(0.7) contrast(1.3) saturate(1.2)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Animated background effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10"></div>
          </div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
          
          <div className="relative z-10 backdrop-blur-[1px]">
            <div className="text-6xl mb-4 drop-shadow-lg">🎁</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
              Your BFCM 2025, Wrapped
          </h1>
            <p className="text-xl sm:text-2xl font-light mb-2 text-white drop-shadow-lg">
            {data.accountName}
          </p>
            <p className="text-base sm:text-lg text-white/90 drop-shadow-md">
              {new Date(data.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(data.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
          </div>
        </div>

        {/* Shopify BFCM 2025 Platform Stats - Prominent Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/50 p-8 border-b-2 border-cyan-500/20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              BFCM 2025 BY THE NUMBERS
          </h2>
            <p className="text-lg text-white/90 mb-6 text-center max-w-3xl mx-auto leading-relaxed">
              Shoppers flocked to independent businesses in record numbers, driving unprecedented sales worldwide. Our merchants just made history, generating a record <span className="text-pink-400 font-bold">$14.6 billion</span> in sales* over Black Friday Cyber Monday (BFCM) weekend, up <span className="text-cyan-400 font-bold">27%</span> from last year. As sale banners lit up and products sold out, <span className="text-pink-400 font-bold">81+ million customers</span>** around the world bought from businesses powered by Shopify.
            </p>
            <p className="text-base text-white/80 mb-8 text-center max-w-3xl mx-auto italic">
              Shopping peaked at 12:01 p.m. EST on Friday when sales reached a dizzying $5.1 million per minute.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/30 backdrop-blur-sm">
                <div className="text-2xl font-bold text-pink-400 mb-1">$14.6B</div>
                <div className="text-xs text-white/80 uppercase tracking-wide">Global Sales</div>
                <div className="text-xs text-cyan-400 mt-1">+27% YoY</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30 backdrop-blur-sm">
                <div className="text-2xl font-bold text-cyan-400 mb-1">81M+</div>
                <div className="text-xs text-white/80 uppercase tracking-wide">Consumers</div>
                <div className="text-xs text-pink-400 mt-1">Worldwide</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30 backdrop-blur-sm">
                <div className="text-2xl font-bold text-purple-400 mb-1">$5.1M</div>
                <div className="text-xs text-white/80 uppercase tracking-wide">Peak/Min</div>
                <div className="text-xs text-cyan-400 mt-1">12:01 PM EST</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400 mb-1">94.9K+</div>
                <div className="text-xs text-white/80 uppercase tracking-wide">Merchants</div>
                <div className="text-xs text-pink-400 mt-1">Best Day Ever</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-white/70">
                <span className="text-pink-400">🛍️</span> <strong className="text-white">Hottest Categories:</strong> Cosmetics, Clothing Tops & Pants, Activewear, Fitness & Nutrition
              </div>
              <div className="text-white/70">
                <span className="text-cyan-400">🛒</span> <strong className="text-white">Average Cart:</strong> $114.70 ($112.29 constant currency)
              </div>
              <div className="text-white/70">
                <span className="text-purple-400">🌎</span> <strong className="text-white">Top Countries:</strong> US, UK, Australia, Germany, Canada
            </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900/50">
          {/* Badges Section */}
          {/* Elegant Section Divider */}
          <div className="my-16 flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="mx-4 text-4xl opacity-50">✨</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></div>
          </div>

          {badges.length > 0 && (
            <AnimatedSection delay={200}>
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
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
          
          {/* Elegant Section Divider */}
          <div className="my-16 flex items-center justify-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="mx-4 text-4xl opacity-50">🎯</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          </div>

          {/* Commerce Personality */}
          {personalities.length > 0 && (
            <AnimatedSection delay={400}>
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Your Commerce Personality
          </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {personalities.map((personality, index) => (
                    <div 
                      key={index}
                      className={`bg-gradient-to-br ${personality.color} rounded-2xl p-8 text-white shadow-lg border border-white/20 backdrop-blur-sm`}
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
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Your BFCM 2025 by the Numbers
            </h2>
            
            {/* YoY Comparison Visualization */}
              {data.metrics2024.total_gmv > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl border-2 border-cyan-500/20 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-center text-white">Year-over-Year Growth</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">GMV</span>
                      <span className={`text-sm font-semibold ${yoyGMVChange >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        {formatPercent(yoyGMVChange)}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-white/60 mb-1">2024</div>
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500/40 to-purple-400/60 rounded-t transition-all duration-1000"
                          style={{ height: '40%' }}
                        ></div>
                        <div className="text-xs text-white/80 mt-1 font-semibold">{formatCurrency(data.metrics2024.total_gmv / 1000)}K</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-white/60 mb-1">2025</div>
                        <div 
                          className="w-full bg-gradient-to-t from-pink-500/60 to-pink-400/80 rounded-t transition-all duration-1000"
                          style={{ height: `${Math.min((data.metrics2025.total_gmv / data.metrics2024.total_gmv) * 40, 100)}%` }}
                        ></div>
                        <div className="text-xs text-white/80 mt-1 font-semibold">{formatCurrency(data.metrics2025.total_gmv / 1000)}K</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">Orders</span>
                      <span className={`text-sm font-semibold ${yoyOrdersChange >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        {formatPercent(yoyOrdersChange)}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-white/60 mb-1">2024</div>
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500/40 to-blue-400/60 rounded-t transition-all duration-1000"
                          style={{ height: '40%' }}
                        ></div>
                        <div className="text-xs text-white/80 mt-1 font-semibold">{data.metrics2024.total_orders.toLocaleString()}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-white/60 mb-1">2025</div>
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-500/60 to-cyan-400/80 rounded-t transition-all duration-1000"
                          style={{ height: `${Math.min((data.metrics2025.total_orders / data.metrics2024.total_orders) * 40, 100)}%` }}
                        ></div>
                        <div className="text-xs text-white/80 mt-1 font-semibold">{data.metrics2025.total_orders.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">AOV</span>
                      <span className={`text-sm font-semibold ${yoyAOVChange >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        {formatPercent(yoyAOVChange)}
                      </span>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-white/60 mb-1">2024</div>
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-500/40 to-indigo-400/60 rounded-t transition-all duration-1000"
                          style={{ height: '40%' }}
                        ></div>
                        <div className="text-xs text-white/80 mt-1 font-semibold">${data.metrics2024.aov.toFixed(0)}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-white/60 mb-1">2025</div>
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500/60 to-purple-400/80 rounded-t transition-all duration-1000"
                          style={{ height: `${Math.min((data.metrics2025.aov / data.metrics2024.aov) * 40, 100)}%` }}
                        ></div>
                        <div className="text-xs text-white/80 mt-1 font-semibold">${data.metrics2025.aov.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className={`bg-gradient-to-br ${getMetricColors('gmv').bgGradient} rounded-2xl p-8 border-2 ${getMetricColors('gmv').border} backdrop-blur-sm relative overflow-hidden`}>
                {yoyGMVChange > 0 && (
                  <div className="absolute top-4 right-4 text-3xl opacity-20">📈</div>
                )}
                <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Total Sales</div>
                <div className={`text-4xl font-bold ${getMetricColors('gmv').textBold} mb-3`}>
                  {formatCurrency(data.metrics2025.total_gmv)}
                </div>
                {data.metrics2024.total_gmv > 0 && (
                  <div className={`text-lg font-semibold ${getGrowthColors(yoyGMVChange >= 0).text}`}>
                    {formatPercent(yoyGMVChange)} vs 2024
                </div>
              )}
                <div className="text-sm text-white/70 mt-3 italic">
                  {getGMVContext(data.metrics2025.total_gmv)}
                </div>
            </div>

              <div className={`bg-gradient-to-br ${getMetricColors('orders').bgGradient} rounded-2xl p-8 border-2 ${getMetricColors('orders').border} backdrop-blur-sm relative overflow-hidden`}>
                {yoyOrdersChange > 0 && (
                  <div className="absolute top-4 right-4 text-3xl opacity-20">📦</div>
                )}
                <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Total Orders</div>
                <div className={`text-4xl font-bold ${getMetricColors('orders').textBold} mb-3`}>
                {data.metrics2025.total_orders.toLocaleString()}
              </div>
              {data.metrics2024.total_orders > 0 && (
                  <div className={`text-lg font-semibold ${getGrowthColors(yoyOrdersChange >= 0).text}`}>
                    {formatPercent(yoyOrdersChange)} vs 2024
                  </div>
                )}
                <div className="text-sm text-white/70 mt-3">
                  Orders fulfilled
                </div>
            </div>

              <div className={`bg-gradient-to-br ${getMetricColors('aov').bgGradient} rounded-2xl p-8 border-2 ${getMetricColors('aov').border} backdrop-blur-sm relative overflow-hidden`}>
                {yoyAOVChange > 0 && (
                  <div className="absolute top-4 right-4 text-3xl opacity-20">💰</div>
                )}
                <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Average Order Value</div>
                <div className={`text-4xl font-bold ${getMetricColors('aov').textBold} mb-3`}>
                {formatCurrency(data.metrics2025.aov)}
              </div>
              {data.metrics2024.aov > 0 && (
                  <div className={`text-lg font-semibold ${getGrowthColors(yoyAOVChange >= 0).text}`}>
                    {formatPercent(yoyAOVChange)} vs 2024
                  </div>
                )}
                <div className="text-sm text-white/70 mt-3">
                  Per order
                </div>
              </div>
            </div>
          </div>
          </AnimatedSection>

          {/* Shopify BFCM 2025 Stats - Platform-Wide Stats */}
          {/* ALWAYS DISPLAY - Official BFCM 2025 platform stats */}
          <AnimatedSection delay={700}>
            <div className="mb-12 p-8 bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-2xl border-2 border-cyan-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Shopify BFCM 2025 Stats
                </h2>
                <QueryTooltip queryKey="shopifyBFCMStats">
                  <span></span>
                </QueryTooltip>
        </div>

              {/* Hardcoded official BFCM 2025 platform stats - ALWAYS DISPLAY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${ColorTheme.gmv.textBold}`}>
                    {formatCurrency(14600000000)}
                  </div>
                  <div className="text-sm text-white/70">Total GMV Processed</div>
                  <div className={`text-xs ${ColorTheme.growth.text} mt-1`}>+27% YoY</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${ColorTheme.gmv.textBold}`}>
                    {formatCurrency(5100000)}
                  </div>
                  <div className="text-sm text-white/70">Peak GMV per Minute</div>
                  <div className={`text-xs ${ColorTheme.platform.accent} mt-1`}>12:01 PM EST</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${ColorTheme.platform.textBold}`}>
                    {'81M+'}
                  </div>
                  <div className="text-sm text-white/70">Consumers</div>
                  <div className={`text-xs ${ColorTheme.platform.accent} mt-1`}>Worldwide</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${ColorTheme.platform.textBold}`}>
                    {String(94900).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}+
                  </div>
                  <div className="text-sm text-white/70">Merchants</div>
                  <div className={`text-xs ${ColorTheme.platform.accent} mt-1`}>Best Day Ever</div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Peak Performance - Enhanced */}
        {data.peakGMV && (
            <AnimatedSection delay={800}>
              <div className="mb-12 p-8 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl border-2 border-pink-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    ⚡ Your Peak Moment
            </h3>
                  <QueryTooltip queryKey="peakGMV">
                    <span></span>
                  </QueryTooltip>
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-3 animate-gradient">
              {formatCurrency(data.peakGMV.peak_gmv_per_minute)} per minute
                </div>
                <div className="text-lg text-white/80 mb-2">
                  {new Date(data.peakGMV.peak_minute).toLocaleString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div className="text-base font-medium text-white/90 italic">
                  {getPeakGMVContext(data.peakGMV.peak_gmv_per_minute, data.peakGMV.peak_minute)}
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* Shopify Ecosystem Wins */}
          {(data.customerInsights.shop_pay_pct !== undefined && data.customerInsights.shop_pay_pct > 0) || 
           (data.channelPerformance.some(c => c.channel_type.toLowerCase() === 'pos')) ? (
            <AnimatedSection delay={900}>
              <div className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🚀 Shopify Ecosystem Wins
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {data.customerInsights.shop_pay_pct !== undefined && data.customerInsights.shop_pay_pct > 0 && (
                    <div className={`bg-gradient-to-br ${ColorTheme.shopPay.bgGradient} rounded-2xl p-6 sm:p-8 border-2 ${ColorTheme.shopPay.border} backdrop-blur-sm`}>
                      <div className="text-4xl mb-3">💳</div>
                      <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Shop Pay Adoption</div>
                      <div className={`text-3xl font-bold ${ColorTheme.shopPay.textBold} mb-2`}>
                        {data.customerInsights.shop_pay_pct.toFixed(1)}%
                      </div>
                      <div className="text-sm text-white/80 mb-3">
                        of orders used Shop Pay
                      </div>
                      {data.customerInsights.shop_pay_pct >= 32 && (
                        <div className={`text-xs ${ColorTheme.shopPay.accent} font-semibold`}>
                          ✨ Above platform average (32%)
                        </div>
                      )}
                      {data.customerInsights.shop_pay_pct < 32 && (
                        <div className="text-xs text-white/60">
                          Platform average: 32%
                        </div>
                      )}
                    </div>
                  )}
                  {data.channelPerformance.some(c => c.channel_type.toLowerCase() === 'pos') && (
                    <div className={`bg-gradient-to-br ${ColorTheme.omnichannel.bgGradient} rounded-2xl p-6 sm:p-8 border-2 ${ColorTheme.omnichannel.border} backdrop-blur-sm`}>
                      <div className="text-4xl mb-3">🏪</div>
                      <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Omnichannel</div>
                      <div className={`text-lg font-semibold ${ColorTheme.omnichannel.textBold} mb-2`}>
                        POS + Online Performance
                      </div>
                      {data.channelPerformance.filter(c => c.channel_type.toLowerCase() === 'pos').map(pos => (
                        <div key="pos" className="text-sm text-white/80">
                          <div className="font-semibold text-white">{formatCurrency(pos.gmv_2025)}</div>
                          <div className="text-xs text-white/70">{pos.orders_2025.toLocaleString()} orders</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {data.customerInsights.shop_pay_pct !== undefined && data.customerInsights.shop_pay_pct > 0 && (
                    <div className={`bg-gradient-to-br ${ColorTheme.growth.bg} to-emerald-500/20 rounded-2xl p-6 sm:p-8 border-2 ${ColorTheme.growth.border} backdrop-blur-sm`}>
                      <div className="text-4xl mb-3">⚡</div>
                      <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Conversion Impact</div>
                      <div className={`text-lg font-semibold ${ColorTheme.growth.textBold} mb-2`}>
                        Shop Pay Advantage
                      </div>
                      <div className="text-sm text-white/80">
                        Shop Pay typically converts 1.72x better than other payment methods
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          ) : null}

          {/* Your Customer Story */}
          {data.customerInsights.top_customer_spend > 0 && (
            <AnimatedSection delay={1000}>
            <div className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Your Customer Story
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className={`bg-gradient-to-br ${getMetricColors('gmv').bgGradient} rounded-2xl p-8 border-2 ${getMetricColors('gmv').border} backdrop-blur-sm`}>
                  <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Top Customer</div>
                  <div className={`text-2xl font-bold ${getMetricColors('gmv').textBold} mb-2`}>
                    {formatCurrency(data.customerInsights.top_customer_spend)}
                  </div>
                  <div className="text-sm text-white/80">
                    {getTopCustomerContext(data)}
                  </div>
                </div>
                <div className={`bg-gradient-to-br ${ColorTheme.customer.new.bg} to-${ColorTheme.customer.returning.bg} rounded-2xl p-8 border-2 ${getMetricColors('orders').border} backdrop-blur-sm`}>
                  <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Customer Mix</div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className={`text-2xl font-bold ${ColorTheme.customer.new.text} mb-1`}>
                        {data.customerInsights.new_customers.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/70">New Customers</div>
                    </div>
                    <div className="w-px h-12 bg-white/20"></div>
                    <div className="flex-1">
                      <div className={`text-2xl font-bold ${ColorTheme.customer.returning.text} mb-1`}>
                        {data.customerInsights.returning_customers.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/70">Returning</div>
                    </div>
                  </div>
                  {data.customerInsights.new_customers + data.customerInsights.returning_customers > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                        <span>New</span>
                        <span>Returning</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-pink-400"
                            style={{ 
                              width: `${((data.customerInsights.new_customers / (data.customerInsights.new_customers + data.customerInsights.returning_customers)) * 100)}%` 
                            }}
                          ></div>
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-cyan-400"
                            style={{ 
                              width: `${((data.customerInsights.returning_customers / (data.customerInsights.new_customers + data.customerInsights.returning_customers)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-pink-400 font-semibold">
                          {((data.customerInsights.new_customers / (data.customerInsights.new_customers + data.customerInsights.returning_customers)) * 100).toFixed(1)}%
                        </span>
                        <span className="text-cyan-400 font-semibold">
                          {((data.customerInsights.returning_customers / (data.customerInsights.new_customers + data.customerInsights.returning_customers)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="text-sm text-white/80 italic mt-3">
                    {getCustomerContext(data)}
                  </div>
                </div>
                <div className={`bg-gradient-to-br ${ColorTheme.shopPay.bgGradient} rounded-2xl p-8 border-2 ${ColorTheme.shopPay.border} backdrop-blur-sm`}>
                  <div className="text-sm text-white/70 mb-2 uppercase tracking-wide">Shop Pay</div>
                  {data.customerInsights.shop_pay_pct !== undefined && data.customerInsights.shop_pay_pct > 0 ? (
                    <>
                      <div className={`text-2xl font-bold ${ColorTheme.shopPay.textBold} mb-2`}>
                        {data.customerInsights.shop_pay_pct.toFixed(1)}%
                      </div>
                      <div className="text-sm text-white/80 mb-3">
                        of orders used Shop Pay
                      </div>
                      {data.customerInsights.shop_pay_orders && (
                        <div className="text-lg font-semibold text-white/90">
                          {data.customerInsights.shop_pay_orders.toLocaleString()} orders
                        </div>
                      )}
                      <div className={`text-xs ${ColorTheme.shopPay.accent} mt-2`}>
                        Platform average: 32%
                      </div>
                    </>
                  ) : (
                    <div className="text-base text-white/70 italic">
                      Shop Pay data not available
                    </div>
                  )}
                </div>
              </div>
            </div>
            </AnimatedSection>
          )}

        {/* Retail Metrics */}
        {data.retailMetrics.retail_orders > 0 && (
          <AnimatedSection delay={1000}>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  📍 Retail Performance
                </h2>
                <QueryTooltip queryKey="retailMetrics">
                  <span></span>
                </QueryTooltip>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Top Retail Location</div>
                  <div className="text-xl font-bold text-purple-400">
                    {data.retailMetrics.top_location || 'N/A'}
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Total Retail GMV</div>
                  <div className="text-xl font-bold text-pink-400">
                    {formatCurrency(data.retailMetrics.retail_gmv)}
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Retail AOV</div>
                  <div className="text-xl font-bold text-purple-400">
                    {formatCurrency(data.retailMetrics.retail_aov)}
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Retail UPT (Units Per Transaction)</div>
                  <div className="text-xl font-bold text-cyan-400">
                    {data.retailMetrics.retail_upt.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Conversion Metrics */}
        {data.conversionMetrics.total_sessions > 0 ? (
          <AnimatedSection delay={1600}>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  📊 Conversion Funnel
                </h2>
                <QueryTooltip queryKey="conversionMetrics">
                  <span></span>
                </QueryTooltip>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Total Sessions</div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {data.conversionMetrics.total_sessions.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Conversion Rate</div>
                  <div className="text-2xl font-bold text-pink-400">
                    {data.conversionMetrics.conversion_rate.toFixed(2)}%
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Cart → Checkout Rate</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {data.conversionMetrics.cart_to_checkout_rate.toFixed(1)}%
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Mobile vs Desktop</div>
                  <div className="text-lg font-semibold text-white">
                    Mobile: {data.conversionMetrics.mobile_sessions.toLocaleString()} | 
                    Desktop: {data.conversionMetrics.desktop_sessions.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        ) : (
          <div className="mb-8 p-4 bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              📊 Conversion Funnel
            </h3>
            <p className="text-sm text-white/70">
              Session and analytics data not available in accessible BigQuery tables.
            </p>
          </div>
        )}

        {/* Shop Breakdown - Per Store Metrics */}
        {data.shopBreakdown.length > 1 && (
          <AnimatedSection delay={2000}>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  📊 Performance by Store
                </h2>
                <QueryTooltip queryKey="shopBreakdown">
                  <span></span>
                </QueryTooltip>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-cyan-500/30">
                      <th className="text-left p-3 font-semibold text-white">Store</th>
                      <th className="text-right p-3 font-semibold text-white">Orders</th>
                      <th className="text-right p-3 font-semibold text-white">GMV</th>
                      <th className="text-right p-3 font-semibold text-white">AOV</th>
                      <th className="text-right p-3 font-semibold text-white">IPT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.shopBreakdown.map((shop) => (
                      <tr key={shop.shop_id} className="border-b border-cyan-500/10 hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="font-semibold text-white">{shop.shop_name || `Shop ${shop.shop_id}`}</div>
                          {shop.shop_name && (
                            <div className="text-xs text-white/50 font-mono mt-0.5">{shop.shop_id}</div>
                          )}
                        </td>
                        <td className="p-3 text-right text-cyan-400">{shop.total_orders.toLocaleString()}</td>
                        <td className="p-3 text-right font-semibold text-pink-400">{formatCurrency(shop.total_gmv)}</td>
                        <td className="p-3 text-right text-purple-400">{formatCurrency(shop.aov)}</td>
                        <td className="p-3 text-right text-blue-400">{shop.units_per_transaction.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Units Per Transaction */}
        {data.unitsPerTransaction > 0 && (
          <AnimatedSection delay={2200}>
            <div className="mb-12 p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  📦 Units Per Transaction (IPT)
                </h3>
                <QueryTooltip queryKey="unitsPerTransaction">
                  <span></span>
                </QueryTooltip>
              </div>
              <div className="text-4xl font-bold text-indigo-400">
                {data.unitsPerTransaction.toFixed(1)}
              </div>
              <div className="text-sm text-white/70 mt-1">
                Average number of units sold per order
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Discount Metrics */}
        {(data.discountMetrics.total_discounted_sales > 0 || data.discountMetrics.total_full_price_sales > 0) && (
          <AnimatedSection delay={2400}>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  💰 Discount Performance
                </h2>
                <QueryTooltip queryKey="discountMetrics">
                  <span></span>
                </QueryTooltip>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Discounted Sales</div>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {formatCurrency(data.discountMetrics.total_discounted_sales)}
                  </div>
                  <div className="text-sm font-medium text-cyan-400">
                    {data.discountMetrics.discounted_sales_pct.toFixed(1)}% of total sales
                  </div>
                </div>
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                  <div className="text-sm text-white/70 mb-1">Full Price Sales</div>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {formatCurrency(data.discountMetrics.total_full_price_sales)}
                  </div>
                  <div className="text-sm font-medium text-pink-400">
                    {data.discountMetrics.full_price_sales_pct.toFixed(1)}% of total sales
                  </div>
                </div>
                {data.discountMetrics.total_discount_amount > 0 && (
                  <div className="p-5 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg border border-amber-500/30 col-span-2 backdrop-blur-sm">
                    <div className="text-sm text-white/70 mb-1">Total Discount Amount</div>
                    <div className="text-xl font-bold text-amber-400">
                      {formatCurrency(data.discountMetrics.total_discount_amount)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

          {/* International Sales - Enhanced with Globe */}
          {data.internationalSales.top_countries.length > 0 && (
            <AnimatedSection delay={1200}>
              <div className="mb-12 relative">
                {/* Globe Background */}
                <div 
                  className="absolute inset-0 bg-center bg-contain bg-no-repeat opacity-15 pointer-events-none"
                  style={{ 
                    backgroundImage: 'url(/assets/globe-bfcm.webp)',
                    filter: 'brightness(1.2) saturate(1.5)',
                    backgroundSize: '60%',
                    backgroundPosition: 'center 20%'
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6 justify-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                      🌍 Your Global Reach
              </h2>
                    <QueryTooltip queryKey="internationalSales">
                      <span></span>
                    </QueryTooltip>
                  </div>
                {getInternationalContext(data) && (
                  <div className={`mb-6 p-6 bg-gradient-to-br ${ColorTheme.international.bgGradient} rounded-2xl border-2 ${ColorTheme.international.border} text-center backdrop-blur-md`}>
                    <div className={`text-lg font-semibold ${ColorTheme.international.textBold}`}>
                      {getInternationalContext(data)}
                    </div>
                  </div>
                )}
            {data.internationalSales.cross_border_gmv > 0 ? (
              <div className={`mb-4 p-5 bg-gradient-to-br ${ColorTheme.international.bgGradient} rounded-lg border ${ColorTheme.international.border} backdrop-blur-sm`}>
                <div className="text-sm text-white/70 mb-1">Cross-Border GMV</div>
                <div className={`text-2xl font-bold ${ColorTheme.international.textBold}`}>
                  {formatCurrency(data.internationalSales.cross_border_gmv)}
                </div>
                <div className="text-sm text-white/70 mt-1">
                  {data.internationalSales.cross_border_pct.toFixed(1)}% of total sales
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-2 text-white">Top Countries by GMV</h3>
              {data.internationalSales.top_countries.map((country, index) => (
                <div key={country.country} className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/30 to-cyan-500/30 flex items-center justify-center font-bold text-pink-400 text-sm border border-pink-500/50">
                      {index + 1}
                    </div>
                    <div className="text-2xl">{getCountryFlag(country.country)}</div>
                    <div className="font-semibold text-white text-lg">{formatCountryName(country.country)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-cyan-400">{formatCurrency(country.gmv)}</div>
                    <div className="text-sm text-white/70 font-medium">{country.orders.toLocaleString()} orders</div>
                  </div>
                </div>
              ))}
            </div>
                </div>
          </div>
            </AnimatedSection>
          )}

          {/* Top Products - Enhanced */}
          {data.topProducts.length > 0 ? (
            <AnimatedSection delay={1400}>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6 justify-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  🏆 Your Best Sellers
                </h2>
                <QueryTooltip queryKey="topProducts">
                  <span></span>
                </QueryTooltip>
              </div>
              {data.topProducts[0] && (
                <div className="mb-6 p-8 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl border-2 border-pink-500/30 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 text-8xl opacity-10">🏆</div>
                  <div className="relative z-10 flex gap-6">
                    {(data.topProducts[0].image_url || data.topProducts[0].product_id) && (
                      <div className="flex-shrink-0">
                        <img 
                          src={data.topProducts[0].image_url || `https://cdn.shopify.com/s/files/1/${data.topProducts[0].product_id}/products/${data.topProducts[0].product_id}_small.jpg`}
                          alt={data.topProducts[0].product_title}
                          className="w-32 h-32 object-cover rounded-xl border-2 border-pink-500/30 shadow-lg"
                          onError={(e) => {
                            // Hide image on error
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm text-white/70 mb-2 uppercase tracking-wide font-semibold">#1 Best Seller</div>
                      <div className="text-3xl font-bold text-pink-400 mb-2">{data.topProducts[0].product_title}</div>
                      {data.topProducts[0].variant_title && (
                        <div className="text-lg text-cyan-400 mb-3">{data.topProducts[0].variant_title}</div>
                      )}
                      <div className="flex items-center gap-6 mb-3">
                        <div className="text-2xl font-bold text-pink-400">
                          {formatCurrency(data.topProducts[0].revenue)}
                        </div>
                        <div className="text-lg font-semibold text-cyan-400">
                          {data.topProducts[0].units_sold.toLocaleString()} units moved
                        </div>
                      </div>
                      <div className="text-base text-white/80 italic font-medium">
                        ✨ Your customers couldn't get enough of this one!
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {data.topProducts.slice(1, 10).map((product, index) => (
                  <div key={index + 2} className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-slate-800/50 via-blue-900/50 to-slate-800/50 rounded-xl border border-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      {(product.image_url || product.product_id) ? (
                        <img 
                          src={product.image_url || `https://cdn.shopify.com/s/files/1/${product.product_id}/products/${product.product_id}_small.jpg`}
                          alt={product.product_title}
                          className="w-16 h-16 object-cover rounded-lg border border-cyan-500/30 shadow-sm"
                          onError={(e) => {
                            // Replace with number badge on error
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500/30 to-cyan-500/30 flex items-center justify-center border border-pink-500/50"><span class="text-2xl font-bold text-pink-400">${index + 2}</span></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-pink-500/30 to-cyan-500/30 flex items-center justify-center border border-pink-500/50">
                          <span className="text-2xl font-bold text-pink-400">{index + 2}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-lg text-white">{product.product_title}</div>
                        {product.variant_title && (
                          <div className="text-sm text-white/70">{product.variant_title}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-pink-400">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-white/70 font-medium">{product.units_sold.toLocaleString()} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </AnimatedSection>
          ) : (
            <div className="mb-8 p-4 bg-gradient-to-br from-slate-800/50 to-blue-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                🏆 Best Selling Items
              </h3>
              <p className="text-sm text-white/70">
                Product-level data not available. Check BigQuery table access.
              </p>
          </div>
        )}

          {/* Channel Performance - Enhanced */}
        {data.channelPerformance.length > 0 && (
            <AnimatedSection delay={1800}>
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent text-center">
                  📈 Sales by Channel
            </h2>
            <div className="space-y-3">
              {data.channelPerformance.map((channel, index) => (
                    <div key={index} className="p-5 bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-semibold text-lg capitalize text-white">{channel.channel_type}</div>
                        <div className={`text-lg font-bold ${channel.yoy_growth_pct >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                      {formatPercent(channel.yoy_growth_pct)} YoY
                    </div>
                  </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-white/70">2025 GMV</div>
                          <div className="font-medium text-lg text-pink-400">{formatCurrency(channel.gmv_2025)}</div>
                        </div>
                        <div>
                          <div className="text-white/70">2025 Orders</div>
                          <div className="font-medium text-cyan-400">{channel.orders_2025.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-white/70">2024 GMV</div>
                          <div className="font-medium text-purple-400">{formatCurrency(channel.gmv_2024)}</div>
                        </div>
                    <div>
                          <div className="text-white/70">2024 Orders</div>
                          <div className="font-medium text-blue-400">{channel.orders_2024.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {biggestChannelGrowth && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                    <div className="text-sm text-white/70 mb-1">🚀 Biggest Channel Growth YoY</div>
                    <div className="text-xl font-bold text-cyan-400 capitalize">
                      {biggestChannelGrowth.channel_type}: {formatPercent(biggestChannelGrowth.yoy_growth_pct)}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* Footer - Shopify Branding */}
          <div className="mt-12 pt-8 border-t-2 border-cyan-500/20 text-center">
            <div className="text-sm text-white/70 mb-2">
              Generated by Shopify Customer Success
            </div>
            <div className="text-xs text-white/60">
              BFCM Wrapped Report • {new Date().toLocaleDateString()}
                </div>
            <div className="text-xs text-white/50 mt-2">
              * Sales figures represent gross merchandise value processed through Shopify's platform<br/>
              ** Consumer count represents unique customers who made purchases
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
