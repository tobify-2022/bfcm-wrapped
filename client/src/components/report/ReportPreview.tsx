import { ReportData } from '@/pages/Home';
import { Download, Info } from 'lucide-react';
import { generatePDF } from '@/lib/pdf-generator';
import { useState } from 'react';

interface ReportPreviewProps {
  data: ReportData;
}

export default function ReportPreview({ data }: ReportPreviewProps) {
  const [hoveredQuery, setHoveredQuery] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

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
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
        <h2 className="text-2xl font-bold text-shopify-dark-green">
          {data.accountName} - BFCM Report
        </h2>
          {data.shopIds.length > 1 && (
            <p className="text-sm text-gray-600 mt-1">
              Reporting for {data.shopIds.length} shops
            </p>
          )}
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-shopify-blue text-white px-4 py-2 rounded-md hover:bg-shopify-blue/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div id="report-content" className="bg-white rounded-lg shadow-lg p-8">
        {/* Hero Section - Smaller Title */}
        <div className="text-center mb-6 pb-6 border-b-2 border-shopify-green/20">
          <h1 className="text-3xl font-bold text-shopify-green mb-2">
            BFCM Wrapped 2025
          </h1>
          <p className="text-lg text-muted-foreground">
            {data.accountName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
          </p>
        </div>

        {/* Shopify BFCM Stats (High Level) */}
        {data.shopifyBFCMStats ? (
        <div className="mb-8 p-6 bg-shopify-green/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              Shopify BFCM 2025 (Platform-Wide)
          </h2>
            <div className="grid grid-cols-4 gap-4 text-center">
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

        {/* Core Metrics - Total GMV, Orders, AOV */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold text-shopify-dark-green">
              Core Performance Metrics
            </h2>
            <QueryTooltip queryKey="metrics2025">
              <span></span>
            </QueryTooltip>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <QueryTooltip queryKey="metrics2025">
              <div className="bg-shopify-green/5 p-5 rounded-lg border border-shopify-green/20">
                <div className="text-sm text-muted-foreground mb-1">Total GMV</div>
                <div className="text-3xl font-bold text-shopify-green mb-1">
                  {formatCurrency(data.metrics2025.total_gmv)}
                </div>
                {data.metrics2024.total_gmv > 0 && (
                  <div className={`text-sm font-medium ${yoyGMVChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(yoyGMVChange)} vs 2024
                  </div>
                )}
              </div>
            </QueryTooltip>

            <QueryTooltip queryKey="metrics2025">
              <div className="bg-shopify-blue/5 p-5 rounded-lg border border-shopify-blue/20">
                <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                <div className="text-3xl font-bold text-shopify-blue mb-1">
                  {data.metrics2025.total_orders.toLocaleString()}
                </div>
                {data.metrics2024.total_orders > 0 && (
                  <div className={`text-sm font-medium ${yoyOrdersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(yoyOrdersChange)} vs 2024
                  </div>
                )}
              </div>
            </QueryTooltip>

            <QueryTooltip queryKey="metrics2025">
              <div className="bg-shopify-dark-green/5 p-5 rounded-lg border border-shopify-dark-green/20">
                <div className="text-sm text-muted-foreground mb-1">Average Order Value (AOV)</div>
                <div className="text-3xl font-bold text-shopify-dark-green mb-1">
                  {formatCurrency(data.metrics2025.aov)}
                </div>
                {data.metrics2024.aov > 0 && (
                  <div className={`text-sm font-medium ${yoyAOVChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(yoyAOVChange)} vs 2024
                  </div>
                )}
              </div>
            </QueryTooltip>
          </div>
        </div>

        {/* Peak Performance */}
        {data.peakGMV && (
          <div className="mb-8 p-6 bg-gradient-to-r from-shopify-green/10 to-shopify-blue/10 rounded-lg border border-shopify-green/20">
            <h3 className="text-xl font-semibold mb-3 text-shopify-dark-green">
              ⚡ Peak Performance
            </h3>
            <div className="text-4xl font-bold text-shopify-green mb-2">
              {formatCurrency(data.peakGMV.peak_gmv_per_minute)} per minute
            </div>
            <div className="text-sm text-muted-foreground">
              Peak minute: {new Date(data.peakGMV.peak_minute).toLocaleString()}
            </div>
          </div>
        )}

        {/* Retail Metrics */}
        {data.retailMetrics.retail_orders > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              📍 Retail Performance
            </h2>
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
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              📊 Conversion Funnel
            </h2>
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
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              📊 Performance by Store
            </h2>
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
            <h3 className="text-xl font-semibold mb-2 text-shopify-dark-green">
              📦 Units Per Transaction (IPT)
            </h3>
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
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              💰 Discount Performance
            </h2>
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

        {/* International Sales */}
        {data.internationalSales.top_countries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              🌍 International Sales
            </h2>
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
        )}

        {/* Top Products - Condensed by 70% */}
        {data.topProducts.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-shopify-dark-green">
              🏆 Best Selling Items (Top 10)
            </h2>
            <div className="space-y-1">
              {data.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center py-1.5 px-3 bg-muted/50 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-shopify-green/20 flex items-center justify-center font-bold text-shopify-green text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{product.product_title}</div>
                      {product.variant_title && (
                        <div className="text-xs text-muted-foreground">{product.variant_title}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{product.units_sold} units</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

        {/* Customer Insights */}
        {data.customerInsights.top_customer_spend > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
              👥 Customer Insights
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="text-sm text-muted-foreground mb-1">Top Customer by Total Spend</div>
                <div className="text-lg font-semibold text-indigo-700 mb-1">
                  {data.customerInsights.top_customer_name || data.customerInsights.top_customer_email || 'N/A'}
                </div>
                <div className="text-2xl font-bold text-indigo-700">
                  {formatCurrency(data.customerInsights.top_customer_spend)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total across {data.customerInsights.top_customer_orders} order{data.customerInsights.top_customer_orders !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="p-5 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="text-sm text-muted-foreground mb-1">New vs Returning Customers</div>
                <div className="text-xl font-bold text-indigo-700 mb-1">
                  New: {data.customerInsights.new_customers.toLocaleString()}
                </div>
                <div className="text-xl font-bold text-indigo-700 mb-2">
                  Returning: {data.customerInsights.returning_customers.toLocaleString()}
                </div>
                {(() => {
                  const totalCustomers = data.customerInsights.new_customers + data.customerInsights.returning_customers;
                  const newPct = totalCustomers > 0 ? (data.customerInsights.new_customers / totalCustomers) * 100 : 0;
                  const returningPct = totalCustomers > 0 ? (data.customerInsights.returning_customers / totalCustomers) * 100 : 0;
                  return (
                    <div className="text-sm text-muted-foreground">
                      <div>New: {newPct.toFixed(1)}%</div>
                      <div>Returning: {returningPct.toFixed(1)}%</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Channel Performance */}
        {data.channelPerformance.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-shopify-dark-green">
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
        )}

        {/* Referrer Data */}
        {data.referrerData.top_referrer && (
          <div className="mb-8 p-5 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold mb-2 text-shopify-dark-green">
              🔗 Top Referrer
            </h3>
            <div className="text-xl font-bold text-yellow-700 mb-1">
              {data.referrerData.top_referrer}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(data.referrerData.referrer_gmv)} GMV • {data.referrerData.referrer_orders} orders
            </div>
          </div>
        )}

        {/* Footer - Shopify Branding */}
        <div className="mt-8 pt-6 border-t text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Generated by Shopify Customer Success
          </div>
          <div className="text-xs text-muted-foreground">
            BFCM Wrapped Report • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
