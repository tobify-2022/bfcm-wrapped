// Quick App Configuration
// BFCM Wrapped - Generate personalized BFCM reports

export default {
  name: 'bfcm-wrapped',
  apis: {
    // Identity API - for user authentication
    identity: true,
    
    // Data Warehouse API - for BigQuery access
    dataWarehouse: true,
  },
  
  // Required OAuth scopes
  scopes: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/bigquery',
  ],
  
  // BigQuery datasets this app needs access to
  bigquery: {
    datasets: [
      'shopify-dw.sales', // For sales_accounts and shops (domain layer)
      'shopify-dw.mart_revenue_data', // For revenue summaries (mart layer)
      'shopify-dw.money_products', // For payment/transaction data (domain layer)
      'shopify-dw.merchant_sales', // For orders and line items (domain layer)
      'shopify-dw.finance', // For GMV data (domain layer)
      'shopify-dw.accounts_and_administration', // For shop profile data (domain layer)
            'shopify-dw.logistics', // For locations_history (domain layer)
            'shopify-dw.buyer_activity', // For attributed_sessions_history, customers_history, customer_email_addresses_history (domain layer)
            'shopify-dw.merchandising', // For product_images (domain layer)
      'shopify-dw.support', // For support data if needed (domain layer)
    ],
  },
};

