# BFCM Wrapped - Quick Site

**Generate personalized BFCM performance reports for Shopify merchants**

---

## 🎯 Overview

A Quick site application that allows MSMs (Merchant Success Managers) to:
1. Authenticate with their Shopify account
2. Select a merchant from their Book of Business
3. Generate comprehensive BFCM performance reports
4. Preview beautiful reports in the browser
5. Download reports as multi-page PDFs

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

```bash
# Deploy to Quick
npm run deploy
```

**Deployment URL:** `https://bfcm-wrapped.quick.shopify.io`

---

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── form/
│   │   │   └── ReportGeneratorForm.tsx
│   │   └── report/
│   │       └── ReportPreview.tsx
│   ├── contexts/
│   │   ├── identity-context.tsx
│   │   ├── bigquery-auth-context.tsx
│   │   └── msm-context.tsx
│   ├── lib/
│   │   ├── quick-api.ts
│   │   ├── bfcm-queries.ts
│   │   ├── book-of-business-service.ts
│   │   └── pdf-generator.ts
│   └── pages/
│       └── Home.tsx
└── public/
    └── manifest.json
```

---

## 📊 Features

- ✅ **Authentication:** Automatic Shopify identity authentication
- ✅ **Book of Business:** Dropdown selection of managed merchants
- ✅ **Comprehensive Metrics:** 
  - Shopify BFCM stats (GMV, peak performance)
  - Account/shop level metrics (AOV, GMV, conversion rates)
  - Retail metrics (top locations, AOV, UPT)
  - Product performance (best sellers, most viewed, most added to cart)
  - Customer insights (top customers, new vs returning)
  - Channel performance and referrer data
  - Year-over-year comparisons
- ✅ **Date Range Selection:** Custom date ranges with BFCM 2025 quick selector
- ✅ **Real-time BigQuery:** Live data fetching from Shopify Data Warehouse
- ✅ **Beautiful Reports:** Shopify-branded, multi-page report preview
- ✅ **PDF Export:** Multi-page PDF generation and download
- ✅ **Error Handling:** Graceful handling of partial query failures
- ✅ **Progress Indicators:** Real-time query progress tracking

---

## 🔧 Configuration

### Quick.js Setup
- **Manifest:** `client/public/manifest.json`
- **Config:** `quick.config.js`
- **Required APIs:** Identity, Data Warehouse

### BigQuery Datasets
- `shopify-dw.sales` - Sales accounts and shop data
- `shopify-dw.mart_revenue_data` - Revenue summaries and account metrics
- `shopify-dw.money_products` - Payment and transaction data
- `shopify-dw.merchant_sales` - Orders, line items, and customer data
- `shopify-dw.finance` - Shop-level GMV data
- `shopify-dw.accounts_and_administration` - Shop profile data
- `shopify-dw.support` - Support data (if needed)

---

## 📝 Usage

1. **Authenticate:** The app automatically authenticates using your Shopify identity
2. **Select Merchant:** Choose from your Book of Business dropdown
3. **Select Dates:** Use the BFCM 2025 quick selector or choose custom dates (max 90 days)
4. **Generate Report:** Click "Generate Report" and wait for queries to complete
5. **Preview:** Review the comprehensive report in the browser
6. **Download:** Click "Download PDF" to save as a multi-page PDF

---

## 🎨 Design

- **Colors:** Shopify green (#95BF47), dark green (#2C3539), blue (#008060)
- **Style:** Bold, celebratory (inspired by Spotify Wrapped)
- **Layout:** Multi-page scrollable report preview with smooth transitions

---

## 📚 Architecture

This project follows Shopify's Data Warehouse architecture best practices:
- Uses Domain layer tables (`merchant_sales`, `money_products`, `sales`)
- Optimized queries with proper date filtering
- Compliant with Medallion architecture patterns

See [DW_ARCHITECTURE_COMPLIANCE.md](./DW_ARCHITECTURE_COMPLIANCE.md) for detailed architecture documentation.

---

## 🚨 Known Limitations

- PDF generation may take a few seconds for large reports
- Some metrics may be unavailable for new accounts or shops without sufficient data
- Channel performance data is currently disabled due to data availability

---

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **jsPDF** & **html2canvas** for PDF generation
- **Shopify Quick** platform for deployment

---

**Version:** 0.1.0  
**Status:** Production Ready  
**Live URL:** https://bfcm-wrapped.quick.shopify.io
