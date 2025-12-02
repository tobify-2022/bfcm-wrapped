import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEffectiveMSM } from '@/contexts/msm-context';
import { fetchBookOfBusiness, fetchAccountShops, formatGMV, type MerchantAccount } from '@/lib/book-of-business-service';
import {
  getCoreMetrics,
  getPeakGMV,
  getTopProducts,
  getChannelPerformance,
  getRetailMetrics,
  getConversionMetrics,
  getCustomerInsights,
  getReferrerData,
  getReferrerDataQuery,
  getShopifyBFCMStats,
  getShopBreakdown,
  getDiscountMetrics,
  getInternationalSales,
  getUnitsPerTransaction,
  getCoreMetricsQuery,
  getPeakGMVQuery,
  getTopProductsQuery,
  getChannelPerformanceQuery,
  getRetailMetricsQuery,
  getConversionMetricsQuery,
  getCustomerInsightsQuery,
  getShopifyBFCMStatsQuery,
  getShopBreakdownQuery,
  getDiscountMetricsQuery,
  getInternationalSalesQuery,
  getUnitsPerTransactionQuery,
  type CoreMetrics,
  type PeakGMV,
  type ProductPerformance,
  type ChannelPerformance,
  type RetailMetrics,
  type ConversionMetrics,
  type CustomerInsights,
  type ReferrerData,
  type ShopifyBFCMStats,
  type ShopBreakdown,
  type DiscountMetrics,
  type InternationalSales,
} from '@/lib/bfcm-queries';
import { ReportData } from '@/pages/Home';

interface ReportGeneratorFormProps {
  onGenerate: (data: ReportData) => void;
  isGenerating: boolean;
}

export default function ReportGeneratorForm({ onGenerate, isGenerating }: ReportGeneratorFormProps) {
  const { effectiveMSMName } = useEffectiveMSM();
  const [inputMode, setInputMode] = useState<'book' | 'manual'>('book'); // Default to Book of Business
  const [selectedAccount, setSelectedAccount] = useState<MerchantAccount | null>(null);
  const [selectedShopIds, setSelectedShopIds] = useState<Set<string>>(new Set()); // Selected shop IDs (multi-select)
  const [manualShopId, setManualShopId] = useState(''); // Manual shop ID input
  const [manualAccountName, setManualAccountName] = useState(''); // Optional account name for manual mode
  // Default to BFCM 2025 dates (Nov 28 - Dec 1, inclusive of full days)
  const [startDate, setStartDate] = useState('2025-11-28');
  const [endDate, setEndDate] = useState('2025-12-01');
  
  // Helper to set BFCM dates quickly
  const setBFCMDates = () => {
    setStartDate('2025-11-28');
    setEndDate('2025-12-01');
  };
  
  // Helper to set BFCM 2024 dates for testing with historical data
  const setBFCM2024Dates = () => {
    setStartDate('2024-11-28');
    setEndDate('2024-12-01');
  };
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    completed: number;
    total: number;
    current: string;
  } | null>(null);
  const [failedQueries, setFailedQueries] = useState<string[]>([]);
  const hasAutoSelectedRef = useRef(false);

  // Calculate 2024 dates (same calendar dates)
  const startDate2024 = startDate.replace('2025', '2024');
  const endDate2024 = endDate.replace('2025', '2024');

  // Fetch Book of Business
  const { data: accounts, isLoading: isLoadingAccounts, error: accountsError } = useQuery({
    queryKey: ['book-of-business', effectiveMSMName],
    queryFn: () => fetchBookOfBusiness(effectiveMSMName),
    enabled: !!effectiveMSMName && inputMode === 'book',
    staleTime: 5 * 60 * 1000,
  });

  // Fetch shops for selected account
  const { data: shops, isLoading: isLoadingShops, error: shopsError } = useQuery({
    queryKey: ['account-shops', selectedAccount?.account_id],
    queryFn: () => fetchAccountShops(selectedAccount!.account_id),
    enabled: !!selectedAccount && inputMode === 'book',
    staleTime: 5 * 60 * 1000,
    retry: 1, // Only retry once
  });

  // Auto-select primary shop when shops load
  useEffect(() => {
    if (shops && shops.length > 0 && selectedShopIds.size === 0) {
      const primaryShop = shops.find(s => s.is_primary);
      if (primaryShop) {
        setSelectedShopIds(new Set([primaryShop.shop_id]));
      } else if (shops.length > 0) {
        // If no primary shop, select first shop
        setSelectedShopIds(new Set([shops[0].shop_id]));
      }
    }
  }, [shops, selectedShopIds.size]);

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-select first account when accounts load (only once)
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount && !hasAutoSelectedRef.current) {
      setSelectedAccount(accounts[0]);
      hasAutoSelectedRef.current = true;
    }
  }, [accounts, selectedAccount]);

  // Filter accounts based on debounced search term
  const filteredAccounts = accounts?.filter((account) =>
    account.account_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    account.account_id.includes(debouncedSearchTerm) ||
    account.primary_shop_id.includes(debouncedSearchTerm)
  ) || [];

  // Ensure selected account is still valid after filtering
  useEffect(() => {
    if (selectedAccount && filteredAccounts.length > 0) {
      const stillExists = filteredAccounts.find(a => a.account_id === selectedAccount.account_id);
      if (!stillExists && filteredAccounts.length > 0) {
        // If selected account is filtered out, select first in filtered list
        setSelectedAccount(filteredAccounts[0]);
      }
    }
  }, [searchTerm, filteredAccounts]);

  const handleGenerate = useCallback(async () => {
    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    // Validate date range (max 90 days)
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      setError('Date range cannot exceed 90 days. Please select a shorter period.');
      return;
    }

    // Validate shop ID format (should be numeric)
    if (inputMode === 'manual' && manualShopId && !/^\d+$/.test(manualShopId.trim())) {
      setError('Shop ID must be a numeric value');
      return;
    }

    // Determine which shop IDs to use
    let finalShopIds: string[];
    let finalAccountName: string;

    if (inputMode === 'book') {
      if (!selectedAccount) {
        setError('Please select an account from your Book of Business.');
        return;
      }
      if (selectedShopIds.size === 0) {
        setError('Please select at least one shop to generate the report.');
        return;
      }
      finalShopIds = Array.from(selectedShopIds);
      finalAccountName = selectedAccount.account_name;
    } else {
      if (!manualShopId || manualShopId.trim().length === 0) {
        setError('Please enter a valid Shop ID');
        return;
      }
      finalShopIds = [manualShopId.trim()];
      finalAccountName = manualAccountName.trim() || `Shop ${manualShopId.trim()}`;
    }

    setError(null);
    setFailedQueries([]);
    setIsGeneratingReport(true);
    setGenerationProgress({ completed: 0, total: 10, current: 'Starting...' });
    
        try {
          // First, verify shop_ids exist and log diagnostic info
          console.log(`🔍 Starting report generation for:`, {
            accountName: finalAccountName,
            shopIds: finalShopIds,
            shopCount: finalShopIds.length,
            period: `${startDate} to ${endDate}`,
            isFutureDate: new Date(startDate) > new Date(),
          });
          
          // Define all queries with labels and query builders for progress tracking
          const queries = [
            { 
              label: 'Core Metrics 2025', 
              key: 'metrics2025',
              fn: () => getCoreMetrics(finalShopIds, startDate, endDate),
              queryFn: () => getCoreMetricsQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Core Metrics 2024', 
              key: 'metrics2024',
              fn: () => getCoreMetrics(finalShopIds, startDate2024, endDate2024),
              queryFn: () => getCoreMetricsQuery(finalShopIds, startDate2024, endDate2024)
            },
            { 
              label: 'Peak GMV', 
              key: 'peakGMV',
              fn: () => getPeakGMV(finalShopIds, startDate, endDate),
              queryFn: () => getPeakGMVQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Top Products', 
              key: 'topProducts',
              fn: () => getTopProducts(finalShopIds, startDate, endDate),
              queryFn: () => getTopProductsQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Channel Performance', 
              key: 'channelPerformance',
              fn: () => getChannelPerformance(finalShopIds, startDate, endDate, startDate2024, endDate2024),
              queryFn: () => getChannelPerformanceQuery(finalShopIds, startDate, endDate, startDate2024, endDate2024)
            },
            { 
              label: 'Retail Metrics', 
              key: 'retailMetrics',
              fn: () => getRetailMetrics(finalShopIds, startDate, endDate),
              queryFn: () => getRetailMetricsQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Conversion Metrics', 
              key: 'conversionMetrics',
              fn: () => getConversionMetrics(finalShopIds, startDate, endDate),
              queryFn: () => getConversionMetricsQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Customer Insights', 
              key: 'customerInsights',
              fn: () => getCustomerInsights(finalShopIds, startDate, endDate),
              queryFn: () => getCustomerInsightsQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Referrer Data', 
              key: 'referrerData',
              fn: () => getReferrerData(finalShopIds, startDate, endDate),
              queryFn: () => getReferrerDataQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Shopify Stats', 
              key: 'shopifyBFCMStats',
              fn: () => getShopifyBFCMStats(startDate, endDate),
              queryFn: () => getShopifyBFCMStatsQuery(startDate, endDate)
            },
            { 
              label: 'Shop Breakdown', 
              key: 'shopBreakdown',
              fn: () => getShopBreakdown(finalShopIds, startDate, endDate),
              queryFn: () => getShopBreakdownQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Discount Metrics', 
              key: 'discountMetrics',
              fn: () => getDiscountMetrics(finalShopIds, startDate, endDate),
              queryFn: () => getDiscountMetricsQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'International Sales', 
              key: 'internationalSales',
              fn: () => getInternationalSales(finalShopIds, startDate, endDate),
              queryFn: () => getInternationalSalesQuery(finalShopIds, startDate, endDate)
            },
            { 
              label: 'Units Per Transaction', 
              key: 'unitsPerTransaction',
              fn: () => getUnitsPerTransaction(finalShopIds, startDate, endDate),
              queryFn: () => getUnitsPerTransactionQuery(finalShopIds, startDate, endDate)
            },
          ];
          
          // Build queries object for tooltips
          const queriesMetadata: ReportData['queries'] = {};
          queries.forEach(q => {
            try {
              if (q.queryFn) {
                queriesMetadata[q.key as keyof typeof queriesMetadata] = {
                  query: q.queryFn(),
                  label: q.label,
                };
              }
            } catch (err) {
              console.warn(`Could not generate query for ${q.key}:`, err);
            }
          });

      // Use Promise.allSettled to handle partial failures gracefully
      // Track progress as queries complete using a ref to avoid race conditions
      let completedCount = 0;
      
      // Engaging loading messages for each query
      const loadingMessages = [
        'Unwrapping your BFCM story...',
        'Counting your wins...',
        'Discovering your peak moments...',
        'Finding your best sellers...',
        'Analyzing channel performance...',
        'Checking retail locations...',
        'Calculating conversion rates...',
        'Understanding your customers...',
        'Tracing referrers...',
        'Gathering platform insights...',
        'Breaking down by store...',
        'Analyzing discount impact...',
        'Mapping global reach...',
        'Calculating units per transaction...',
      ];
      
      const updateProgress = (index: number, label: string) => {
        completedCount++;
        const messageIndex = Math.min(index, loadingMessages.length - 1);
        setGenerationProgress({
          completed: completedCount,
          total: queries.length,
          current: loadingMessages[messageIndex] || `Fetching ${label}...`,
        });
      };

      const results = await Promise.allSettled(
        queries.map(async (query, index) => {
          try {
            const result = await query.fn();
            // Update progress when query completes successfully
            updateProgress(index, query.label);
            return result;
          } catch (error) {
            // Still count as completed even if it failed
            updateProgress(index, query.label);
            throw error;
          }
        })
      );

      setGenerationProgress({ completed: queries.length, total: queries.length, current: 'Putting it all together...' });

      // Extract results and track failures with proper typing
      const metrics2025Result = results[0];
      const metrics2024Result = results[1];
      const peakGMVResult = results[2];
      const topProductsResult = results[3];
      const channelPerformanceResult = results[4];
      const retailMetricsResult = results[5];
      const conversionMetricsResult = results[6];
      const customerInsightsResult = results[7];
      const referrerDataResult = results[8];
      const shopifyBFCMStatsResult = results[9];
      const shopBreakdownResult = results[10];
      const discountMetricsResult = results[11];
      const internationalSalesResult = results[12];
      const unitsPerTransactionResult = results[13];

      // Collect errors for reporting
      const errors: string[] = [];
      
      const metrics2025: CoreMetrics = metrics2025Result.status === 'fulfilled' 
        ? (metrics2025Result.value as CoreMetrics)
        : (errors.push('Core Metrics 2025'), { total_orders: 0, total_gmv: 0, aov: 0 });
      
      const metrics2024: CoreMetrics = metrics2024Result.status === 'fulfilled' 
        ? (metrics2024Result.value as CoreMetrics)
        : (errors.push('Core Metrics 2024'), { total_orders: 0, total_gmv: 0, aov: 0 });
      
      const peakGMV: PeakGMV | null = peakGMVResult.status === 'fulfilled' 
        ? (peakGMVResult.value as PeakGMV | null)
        : (errors.push('Peak GMV'), null);
      
      const topProducts: ProductPerformance[] = topProductsResult.status === 'fulfilled' 
        ? (topProductsResult.value as ProductPerformance[])
        : (errors.push('Top Products'), []);
      
      const channelPerformance: ChannelPerformance[] = channelPerformanceResult.status === 'fulfilled' 
        ? (channelPerformanceResult.value as ChannelPerformance[])
        : (errors.push('Channel Performance'), []);
      
      const retailMetrics: RetailMetrics = retailMetricsResult.status === 'fulfilled' 
        ? (retailMetricsResult.value as RetailMetrics)
        : (errors.push('Retail Metrics'), { top_location: null, retail_gmv: 0, retail_aov: 0, retail_upt: 0, retail_orders: 0 });
      
      const conversionMetrics: ConversionMetrics = conversionMetricsResult.status === 'fulfilled' 
        ? (conversionMetricsResult.value as ConversionMetrics)
        : (errors.push('Conversion Metrics'), { total_sessions: 0, sessions_with_cart: 0, sessions_with_checkout: 0, cart_to_checkout_rate: 0, mobile_sessions: 0, desktop_sessions: 0, conversion_rate: 0 });
      
      const customerInsights: CustomerInsights = customerInsightsResult.status === 'fulfilled' 
        ? (customerInsightsResult.value as CustomerInsights)
        : (errors.push('Customer Insights'), { top_customer_email: null, top_customer_name: null, top_customer_spend: 0, top_customer_orders: 0, new_customers: 0, returning_customers: 0 });
      
      const referrerData: ReferrerData = referrerDataResult.status === 'fulfilled' 
        ? (() => {
            const value = referrerDataResult.value as { data?: ReferrerData; query?: string } | ReferrerData;
            return 'data' in value && value.data ? value.data : (value as ReferrerData);
          })()
        : (errors.push('Referrer Data'), { top_referrer: null, referrer_gmv: 0, referrer_orders: 0 });
      
      const shopifyBFCMStats: ShopifyBFCMStats | null = shopifyBFCMStatsResult.status === 'fulfilled' 
        ? (shopifyBFCMStatsResult.value as ShopifyBFCMStats | null)
        : (errors.push('Shopify Stats'), null);
      
      const shopBreakdown: ShopBreakdown[] = shopBreakdownResult.status === 'fulfilled'
        ? (shopBreakdownResult.value as ShopBreakdown[])
        : (errors.push('Shop Breakdown'), []);
      
      const discountMetrics: DiscountMetrics = discountMetricsResult.status === 'fulfilled'
        ? (discountMetricsResult.value as DiscountMetrics)
        : (errors.push('Discount Metrics'), { total_discounted_sales: 0, total_full_price_sales: 0, discounted_sales_pct: 0, full_price_sales_pct: 0, total_discount_amount: 0 });
      
      const internationalSales: InternationalSales = internationalSalesResult.status === 'fulfilled'
        ? (internationalSalesResult.value as InternationalSales)
        : (errors.push('International Sales'), { cross_border_gmv: 0, cross_border_orders: 0, cross_border_pct: 0, top_countries: [] });
      
      const unitsPerTransaction: number = unitsPerTransactionResult.status === 'fulfilled'
        ? (unitsPerTransactionResult.value as number)
        : (errors.push('Units Per Transaction'), 0);

      // Track failed queries for display
      if (errors.length > 0) {
        setFailedQueries(errors);
        console.warn('⚠️ Some queries failed:', errors);
        if (errors.length === queries.length) {
          // All queries failed - this is a real error
          throw new Error(`All queries failed. Please check your connection and try again.`);
        }
      }

      const reportData: ReportData = {
        accountName: finalAccountName,
        shopIds: finalShopIds,
        startDate,
        endDate,
        metrics2025,
        metrics2024,
        peakGMV,
        topProducts,
        channelPerformance,
        retailMetrics,
        conversionMetrics,
        customerInsights,
        referrerData,
        shopifyBFCMStats,
        shopBreakdown,
        discountMetrics,
        internationalSales,
        unitsPerTransaction,
        queries: queriesMetadata,
      };

      onGenerate(reportData);
      setGenerationProgress(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      console.error('Report generation error:', err);
      setGenerationProgress(null);
    } finally {
      setIsGeneratingReport(false);
    }
      }, [inputMode, selectedAccount, selectedShopIds, manualShopId, manualAccountName, startDate, endDate, startDate2024, endDate2024, onGenerate]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isGenerating && !isGeneratingReport && 
          ((inputMode === 'book' && selectedAccount) || (inputMode === 'manual' && manualShopId))) {
        handleGenerate();
      }
    }
  }, [isGenerating, isGeneratingReport, inputMode, selectedAccount, manualShopId, handleGenerate]);

  return (
    <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg p-6" onKeyDown={handleKeyDown}>
      <h2 className="text-2xl font-semibold mb-6 text-shopify-dark-green">
        Generate BFCM Report
      </h2>

      <div className="space-y-4">
        {/* Input Mode Toggle */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Merchant</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="book"
                checked={inputMode === 'book'}
                onChange={() => setInputMode('book')}
                className="mr-2"
              />
              <span>My Book of Business</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="manual"
                checked={inputMode === 'manual'}
                onChange={() => setInputMode('manual')}
                className="mr-2"
              />
              <span>Manual Shop ID</span>
            </label>
          </div>
        </div>

        {/* Book of Business Selector */}
        {inputMode === 'book' && (
          <div>
            <label htmlFor="accountSelect" className="block text-sm font-medium mb-2">
              Select Account
            </label>
            
            {isLoadingAccounts && (
              <p className="text-sm text-muted-foreground">Loading your accounts...</p>
            )}
            
            {accountsError && (
              <p className="text-sm text-red-600">Failed to load accounts. Try manual mode.</p>
            )}
            
            {accounts && accounts.length === 0 && (
              <p className="text-sm text-amber-600">No accounts found. Try manual mode.</p>
            )}
            
            {accounts && accounts.length > 0 && (
              <>
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-shopify-green"
                  aria-label="Search accounts by name, account ID, or shop ID"
                />
                
                {/* Account Dropdown */}
                <select
                  id="accountSelect"
                  value={selectedAccount?.account_id || ''}
                  onChange={(e) => {
                    const account = accounts.find(a => a.account_id === e.target.value);
                    if (account) {
                      setSelectedAccount(account);
                      setSearchTerm(''); // Clear search when manually selecting
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-shopify-green bg-white"
                  aria-label="Select merchant account from Book of Business"
                >
                  {filteredAccounts.length === 0 ? (
                    <option value="">No accounts found</option>
                  ) : (
                    filteredAccounts.map((account) => (
                      <option key={account.account_id} value={account.account_id}>
                        {account.account_name} - {formatGMV(account.gmv_usd_l365d)} GMV
                      </option>
                    ))
                  )}
                </select>
                
                {selectedAccount && (
                  <div className="mt-3 space-y-3">
                    <div className="p-4 bg-shopify-green/5 border border-shopify-green/20 rounded-md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-shopify-dark-green mb-1">
                            {selectedAccount.account_name}
                          </p>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>GMV (L365D): <span className="font-semibold text-shopify-green">{formatGMV(selectedAccount.gmv_usd_l365d)}</span></p>
                            <p>Total Shops: <span className="font-semibold">{selectedAccount.shop_count}</span></p>
                          </div>
                        </div>
                        <div className="ml-4 text-2xl">✓</div>
                      </div>
                    </div>
                    
                    {/* Shop Selection */}
                    {isLoadingShops ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading shops...
                      </div>
                    ) : shopsError ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600 mb-1">
                          Failed to load shops. Please try again or use manual Shop ID mode.
                        </p>
                        <p className="text-xs text-red-500">
                          Error: {shopsError instanceof Error ? shopsError.message : 'Unknown error'}
                        </p>
                      </div>
                    ) : shops && shops.length > 0 ? (
                      <div className="border rounded-md p-4 bg-white">
                        <label className="block text-sm font-medium mb-3">
                          Select Shops ({selectedShopIds.size} selected)
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {shops.map((shop) => (
                            <label
                              key={shop.shop_id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedShopIds.has(shop.shop_id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedShopIds);
                                  if (e.target.checked) {
                                    newSelected.add(shop.shop_id);
                                  } else {
                                    newSelected.delete(shop.shop_id);
                                  }
                                  setSelectedShopIds(newSelected);
                                }}
                                className="mr-3 h-4 w-4 text-shopify-green focus:ring-shopify-green border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">{shop.shop_id}</span>
                                  {shop.is_primary && (
                                    <span className="text-xs bg-shopify-green text-white px-2 py-0.5 rounded">Primary</span>
                                  )}
                                </div>
                                {shop.gmv_usd_l365d > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {formatGMV(shop.gmv_usd_l365d)} GMV
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (shops) {
                                setSelectedShopIds(new Set(shops.map(s => s.shop_id)));
                              }
                            }}
                            className="text-xs text-shopify-green hover:text-shopify-dark-green underline"
                          >
                            Select All
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            type="button"
                            onClick={() => setSelectedShopIds(new Set())}
                            className="text-xs text-shopify-green hover:text-shopify-dark-green underline"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    ) : shops && shops.length === 0 ? (
                      <div className="p-4 text-center text-sm text-amber-600 border border-amber-200 rounded-md bg-amber-50">
                        ⚠️ No shops found for this account
                      </div>
                    ) : null}
                  </div>
                )}

              </>
            )}
          </div>
        )}

        {/* Manual Shop ID Input */}
        {inputMode === 'manual' && (
          <>
            <div>
              <label htmlFor="manualShopId" className="block text-sm font-medium mb-2">
                Shop ID
          </label>
          <input
                id="manualShopId"
            type="text"
                value={manualShopId}
                onChange={(e) => setManualShopId(e.target.value)}
                placeholder="12345678"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-shopify-green"
                aria-label="Enter Shop ID manually"
          />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the numeric Shop ID (find it in BigQuery or admin URL)
              </p>
            </div>
            <div>
              <label htmlFor="manualAccountName" className="block text-sm font-medium mb-2">
                Account/Shop Name (Optional)
              </label>
              <input
                id="manualAccountName"
                type="text"
                value={manualAccountName}
                onChange={(e) => setManualAccountName(e.target.value)}
                placeholder="LSKD"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-shopify-green"
                aria-label="Enter account or shop name (optional)"
              />
            </div>
          </>
        )}

          <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="startDate" className="block text-sm font-medium">
              Date Range
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={setBFCM2024Dates}
                className="text-xs text-shopify-blue hover:text-shopify-dark-green underline"
                title="Use 2024 dates to test with historical data"
              >
                Use BFCM 2024 dates
              </button>
              <button
                type="button"
                onClick={setBFCMDates}
                className="text-xs text-shopify-green hover:text-shopify-dark-green underline"
              >
                Use BFCM 2025 dates
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-shopify-green"
              aria-label="Start date for report period"
            />
          </div>

          <div>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-shopify-green"
              aria-label="End date for report period"
            />
          </div>
        </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days selected
            {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) > 90 && (
              <span className="text-red-600 ml-1">(Max 90 days)</span>
            )}
          </p>
        </div>

        {generationProgress && (
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-300 p-6 rounded-lg animate-fade-in shadow-lg" role="status" aria-live="polite" aria-atomic="true">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600" aria-hidden="true"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border-2 border-blue-400 opacity-20"></div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-blue-900 mb-2">
                  {generationProgress.current}
                </p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-3 overflow-hidden shadow-inner" role="progressbar" aria-valuenow={generationProgress.completed} aria-valuemin={0} aria-valuemax={generationProgress.total}>
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${(generationProgress.completed / generationProgress.total) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-blue-700 font-medium">
                    {generationProgress.completed} of {generationProgress.total} queries completed
                  </p>
                  <p className="text-xs text-blue-600 font-semibold">
                    {Math.round((generationProgress.completed / generationProgress.total) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {failedQueries.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm animate-fade-in" role="alert">
            <div className="flex items-start gap-2">
              <span className="text-amber-600 font-semibold">⚠️</span>
              <div>
                <p className="font-medium mb-1">Some queries failed (report generated with available data):</p>
                <ul className="list-disc list-inside space-y-1">
                  {failedQueries.map((query, idx) => (
                    <li key={idx}>{query}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-sm animate-fade-in" role="alert">
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-semibold">⚠️</span>
              <div>
                <p className="font-medium mb-1">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={
            (inputMode === 'book' && (!selectedAccount || selectedShopIds.size === 0)) ||
            (inputMode === 'manual' && !manualShopId) ||
            isGenerating ||
            isGeneratingReport
          }
          className="w-full bg-shopify-green text-white py-3 px-6 rounded-md font-medium hover:bg-shopify-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          aria-label="Generate BFCM report (Cmd/Ctrl+Enter)"
        >
          {(isGenerating || isGeneratingReport) ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              Generate Report
              <span className="text-xs opacity-75 ml-2">(⌘+Enter)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

