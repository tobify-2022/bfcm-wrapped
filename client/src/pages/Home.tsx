import { useState } from 'react';
import { useBigQueryAuth } from '@/contexts/bigquery-auth-context';
import ReportGeneratorForm from '@/components/form/ReportGeneratorForm';
import ReportPreview from '@/components/report/ReportPreview';
import { X } from 'lucide-react';

import {
  CoreMetrics,
  PeakGMV,
  ProductPerformance,
  ChannelPerformance,
  RetailMetrics,
  ConversionMetrics,
  CustomerInsights,
  ReferrerData,
  ShopifyBFCMStats,
  ShopBreakdown,
  DiscountMetrics,
  InternationalSales,
} from '@/lib/bfcm-queries';

export interface QueryMetadata {
  query: string;
  label: string;
}

export interface ReportData {
  accountName: string;
  shopIds: string[];
  startDate: string;
  endDate: string;
  metrics2025: CoreMetrics;
  metrics2024: CoreMetrics;
  peakGMV: PeakGMV | null;
  topProducts: ProductPerformance[];
  channelPerformance: ChannelPerformance[];
  retailMetrics: RetailMetrics;
  conversionMetrics: ConversionMetrics;
  customerInsights: CustomerInsights;
  referrerData: ReferrerData;
  shopifyBFCMStats: ShopifyBFCMStats | null;
  shopBreakdown: ShopBreakdown[];
  discountMetrics: DiscountMetrics;
  internationalSales: InternationalSales;
  unitsPerTransaction: number;
  queries: {
    metrics2025?: QueryMetadata;
    metrics2024?: QueryMetadata;
    peakGMV?: QueryMetadata;
    topProducts?: QueryMetadata;
    channelPerformance?: QueryMetadata;
    retailMetrics?: QueryMetadata;
    conversionMetrics?: QueryMetadata;
    customerInsights?: QueryMetadata;
    referrerData?: QueryMetadata;
    shopifyBFCMStats?: QueryMetadata;
    shopBreakdown?: QueryMetadata;
    discountMetrics?: QueryMetadata;
    internationalSales?: QueryMetadata;
    unitsPerTransaction?: QueryMetadata;
  };
}

function Home() {
  const { isAuthenticated, requestAuth, isLoading: authLoading } = useBigQueryAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Request auth on mount if needed
  if (!isAuthenticated && !authLoading) {
    requestAuth();
  }

  const handleGenerateReport = async (data: ReportData) => {
    setIsGenerating(true);
    try {
      setReportData(data);
      // Scroll to report after a brief delay
      setTimeout(() => {
        const reportElement = document.getElementById('report-content');
        if (reportElement) {
          reportElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearReport = () => {
    setReportData(null);
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-shopify-green/5 to-shopify-blue/5">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-shopify-dark-green mb-2">
            🎁 BFCM Wrapped
          </h1>
          <p className="text-muted-foreground">
            Generate personalized BFCM performance reports for your merchants
          </p>
          <div className="text-xs text-muted-foreground mt-2">v0.1.0</div>
        </header>

        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-card rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopify-green mx-auto mb-4"></div>
            <p className="text-muted-foreground mb-2">
              Authenticating with BigQuery...
            </p>
            <p className="text-sm text-muted-foreground">
              Please approve the OAuth popup if it appears
            </p>
          </div>
        ) : (
          <>
            <ReportGeneratorForm
              onGenerate={handleGenerateReport}
              isGenerating={isGenerating}
            />
            
            {reportData && (
              <div className="mt-8 animate-fade-in">
                <div className="max-w-5xl mx-auto mb-4 flex justify-end">
                  <button
                    onClick={handleClearReport}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Clear report and start over"
                  >
                    <X className="w-4 h-4" />
                    Clear Report
                  </button>
                </div>
                <ReportPreview data={reportData} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;

