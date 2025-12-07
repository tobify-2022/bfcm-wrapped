# 📊 Merchant Analysis Reports v5.1

## Overview
This folder contains the complete v5.1 system for generating data-driven merchant analysis reports using Shopify's Data Platform.

## 📁 Contents

### 1. **MERCHANT_ANALYSIS_INSTRUCTIONS-v5.1.md** (79KB)
The comprehensive instruction document with:
- **CRITICAL Data Availability Protocol** - Ensures all data is queried correctly
- **40+ SQL Queries** - Complete query library for all report sections
- **Schema Reference Guide** - Key table structures and field mappings
- **Step-by-step Implementation** - From setup to final report generation

**Key Features:**
- **Integrated Sessions & Conversion Analysis** (NEW) - Sessions analytics merged with checkout funnel, ALWAYS includes session data with conditional notes
- **Dual-Currency Reporting** (NEW) - Generate USD + converted currency reports (EUR, GBP, CAD, etc.)
- Multi-Item Order & Upsell Analysis (NEW)
- Top Product Combinations Analysis (NEW)
- Customer Value Segmentation (NEW)
- Peak Hours Performance (24-hour view) (NEW)
- Sales Channel Performance with App vs Web breakdown (NEW)
- Checkout Funnel Analysis with Add to Cart (when available)
- Geographic Performance
- **Enhanced Payment Methods Distribution** (NEW) - Credit Card vs Apple Pay vs Google Pay vs Shop Pay breakdown
- PDF-Friendly Black Text Styling (NEW)

### 2. **BrandName_SalesEvent_Analysis_Report_Template.html** (74KB)
Flexible HTML template for generating individual store reports:
- Single or multiple sales events
- Year-over-year comparisons
- Conditional sections (traffic sources, session data, express checkout)
- Professional styling with Chart.js visualizations

### 3. **Comparison_Report_Template.html** (108KB) ⭐ NEW
Side-by-side comparison template for analyzing two stores:
- Market-to-market comparisons (e.g., France vs Netherlands)
- Regional performance analysis
- A/B testing different store setups
- Winner badges highlight superior metrics
- Cultural difference insights (payment methods, shopping patterns)
- Complete with 9 comparison sections + TL;DR
- PDF-optimized with compact header

**When to Use:**
- Same brand across different countries/regions
- B2B vs B2C channel comparison
- Pre/post migration analysis
- Performance benchmarking

### 4. **Example Reports**

#### Veralab_Nov3-9_2025_Sales_Analysis.html (114KB)
Complete report for Veralab (Shop ID: 79781134652)
- Sales Event: Nov 3-9, 2025
- 50,404 orders, $6.06M revenue
- 96.77% multi-item order rate
- Top product combinations: OLIO DENSO + SPUMONE (8.79%)
- Headless merchant (no session data)

#### Lounge_Nov16-20_2025_Sales_Analysis.html (85KB)
Complete report for Lounge (Shop ID: 27823505460)
- Sales Event: Nov 16-20, 2025
- 76,911 orders, $9.42M revenue
- 94.40% multi-item order rate
- Top product combinations: Blossom Smaragdgrün Set (12.39%)
- Full session data available

#### Lounge_FR_vs_NL_Comparison_Nov16-20_2025.html (108KB) ⭐ NEW
Side-by-side comparison report for Lounge across two markets
- **France Store** (27647770659): 14,788 orders, $1.38M revenue
- **Netherlands Store** (29112107087): 16,467 orders, $1.83M revenue (+32%)
- **Key Insight:** Netherlands converts 61% vs France's 53% (+14%)
- **Critical Finding:** Completely different payment landscapes (NL: Klarna/iDeal 77%, FR: Shopify Payments 85%)
- **Winner:** Netherlands outperforms across all metrics

## 🚀 Quick Start

### Prerequisites
1. **Cursor IDE** with MCP tools configured
2. **Data Platform MCP** access (#data-portal-mcp on Slack)
3. Required MCP tools:
   - `mcp_data-portal_search_data_platform`
   - `mcp_data-portal_get_entry_metadata`
   - `mcp_data-portal_query_bigquery`
   - `mcp_data-portal_analyze_query_results`

### Generate a New Report

1. **Gather Information:**
   - Brand name (e.g., "Veralab", "Lounge")
   - Shop ID (e.g., 79781134652)
   - **Multi-store check:** Does this merchant operate multiple store IDs in different markets? (If yes, list them)
   - **Sales channel check:** Does this merchant have a custom mobile app, POS system, or multi-channel setup?
   - **Currency conversion:** Should two reports be generated (USD + converted currency like EUR, GBP, CAD)?
   - Sales event dates (e.g., "Nov 3-9, 2025")

2. **Open Instruction Document:**
   ```bash
   open MERCHANT_ANALYSIS_INSTRUCTIONS-v5.1.md
   ```

## ⚠️ CRITICAL: NO ESTIMATED DATA POLICY

**ABSOLUTE REQUIREMENT**: ALL data in reports MUST come from actual Shopify Data Platform queries.

### What This Means:
- ❌ **NEVER** generate reports with placeholder/estimated/made-up data
- ❌ **NEVER** use "reasonable guesses" or "typical values"
- ❌ **NEVER** proceed with report generation if queries fail
- ✅ **ALWAYS** query `mcp_data-portal-mcp_query_bigquery` for every data point
- ✅ **ALWAYS** show query results to the user before generating HTML
- ✅ **ALWAYS** validate that report data matches query results exactly

### If a Query Fails:
1. **STOP** - Do not generate the report with estimates
2. **DEBUG** - Read the error message and fix the query
3. **RE-QUERY** - Run the corrected query
4. **VERIFY** - Confirm data looks correct
5. **PROCEED** - Only then generate the HTML

### ⚠️ CRITICAL: Revenue Calculation Formula

**IMPORTANT**: Use the **Shopify Admin Total Sales formula** to match what merchants see in their dashboard.

**⚠️ CRITICAL NOTE**: Discounts and Returns fields in `order_sales_summary` are **ALREADY NEGATIVE** in the database!

**Correct SQL Implementation (ADD discounts/returns since they're negative):**
```sql
-- For USD reports
SUM(oss.gross_sales_usd) 
+ SUM(oss.discounts_usd)    -- ADD because discounts are already negative
+ SUM(oss.returns_usd)       -- ADD because returns are already negative
+ SUM(oss.taxes_usd) 
+ SUM(oss.shipping_usd) 
+ SUM(oss.duties_usd) 
+ SUM(oss.additional_fees_usd)
```

**For local currency reports (GBP, EUR, CAD, etc.), use `_local` fields:**
```sql
SUM(oss.gross_sales_local) 
+ SUM(oss.discounts_local)   -- ADD because discounts are already negative
+ SUM(oss.returns_local)      -- ADD because returns are already negative 
- SUM(oss.returns_local) 
+ SUM(oss.taxes_local) 
+ SUM(oss.shipping_local) 
+ SUM(oss.duties_local) 
+ SUM(oss.additional_fees_local)
```

**❌ DO NOT USE:** `total_sales_usd` or `total_sales_local` fields directly - these exclude taxes and will be 30-50% lower than Shopify Admin!

### Average Order Value (AOV) Calculation

**IMPORTANT**: Shopify Admin calculates AOV differently from Total Sales!

**AOV Formula (Shopify Admin):**
```sql
AOV = (Gross Sales - Discounts) / Total Orders
```

**SQL Implementation (USD):**
```sql
(SUM(oss.gross_sales_usd) - SUM(oss.discounts_usd)) / COUNT(DISTINCT o.order_id)
```

**SQL Implementation (Local Currency):**
```sql
(SUM(oss.gross_sales_local) - SUM(oss.discounts_local)) / COUNT(DISTINCT o.order_id)
```

**What's EXCLUDED from AOV:**
- ❌ Returns
- ❌ Taxes
- ❌ Shipping
- ❌ Duties/Fees

**Why it matters:** AOV represents the average product value per order (after discounts), excluding taxes and shipping. This is what merchants use to measure product pricing effectiveness and upselling success.

**Example:**
- Total Sales = $4,550,483 (includes taxes, shipping, etc.)
- Gross Sales = $3,171,294
- Discounts = $717,353
- Orders = 53,952
- **AOV = ($3,171,294 - $717,353) / 53,952 = $72.08** ✅
- ~~AOV = $4,550,483 / 53,952 = $84.34~~ ❌ WRONG!

### Quality Control Checklist:
Before generating any HTML report, verify:
- [ ] All queries have been executed successfully
- [ ] Query results are saved and visible
- [ ] Order counts match between query results and HTML
- [ ] **Total Sales calculated using Shopify Admin formula (includes taxes)**
- [ ] **AOV calculated as (Gross Sales - Discounts) / Orders**
- [ ] Revenue totals match Shopify Admin dashboard
- [ ] AOV matches Shopify Admin dashboard
- [ ] Conversion rates are calculated from actual session data (not estimated)
- [ ] No placeholder text like "estimated" or "approximately" in the report

**Remember**: Real merchant data = Real business decisions. Accuracy is paramount.

3. **Follow the Protocol:**
   - Start with Section 1: Data Availability & Query Protocol
   - ALWAYS run `get_entry_metadata` before writing queries
   - Use the 40+ query library as templates
   - Follow the modular generation approach

4. **Request Report Generation:**
   
   **For Individual Store Reports:**
   ```
   "Generate a comprehensive sales report for [Brand Name] 
   (Shop ID: [SHOP_ID]) for the sales event from [START_DATE] to [END_DATE]
   
   [If applicable] Note: This merchant has a custom mobile app / POS system / multi-channel setup"
   ```

   **For Multi-Store Merchants:**
   ```
   "Generate a report for [Brand Name] (Shop ID: [SHOP_ID]) for [DATE_RANGE].
   
   Note: Multi-store setup (US, UK, Germany). Focus recommendations on 
   market optimization rather than expansion, as other store IDs serve 
   additional geographies.
   
   [If applicable] Also note: Custom mobile app / POS system present"
   ```

   **For Flash Sales/Events with Known Channel Info:**
   ```
   "Generate a 24h flash sale report for [Brand Name] (Shop ID: [SHOP_ID]) 
   for [DATE].
   
   Context: They have a custom shopping app and sell through both web and app channels"
   ```

   **For Dual-Currency Reports (USD + Converted Currency):**
   ```
   "Generate a comprehensive sales report for [Brand Name] (Shop ID: [SHOP_ID]) 
   for [DATE_RANGE].
   
   Generate TWO reports:
   1. Original report in USD
   2. Converted report in EUR (or GBP, CAD, etc.)
   
   [If applicable] Context: European merchant, primary market uses euros"
   ```
   
   **Example - Dual Currency for European Flash Sale:**
   ```
   "Generate a flash sale report for Teveo (Shop ID: 9862938721) for November 16, 2025.
   
   Generate both USD and EUR versions. They have a custom shopping app."
   ```

   **For Comparison Reports (Two Stores):**
   ```
   "Generate a comparison report for [Brand Name]:
   - Store 1: Shop ID [ID1] (serving [MARKET1])
   - Store 2: Shop ID [ID2] (serving [MARKET2])
   - Time Period: [START_DATE] - [END_DATE]
   - Report Format: Side-by-side comparison (Format A)"
   ```

## 📊 Report Types

### Individual Store Reports (12 Sections)
Complete analysis for a single store - **ALWAYS generate sections in this order:**

1. **Executive Summary** - Key metrics overview with insights
2. **Business Overview** - Orders, revenue, discounts, AOV, daily performance trends
3. **Sales Channel Performance** - Channel breakdown with pie chart (Online Store, Shop App, TikTok Shop, etc.)
4. **Peak Hours Performance** - Full 24-hour view of order activity
5. **Top Product & Category Performance** - Top 10 products by name with % of total revenue
6. **Multi-Item Order Analysis** - Basket analysis, upsell opportunities, product combinations
7. **Sessions, Conversion & Checkout Funnel** - Session analytics + checkout funnel (ALWAYS includes sessions with conditional notes)
8. **Geographic Performance** - Country breakdown with AOV analysis
9. **Customer Segmentation** - New vs. returning customers, order value tiers
10. **Traffic Source Attribution** - Marketing channel performance (note if headless/limited data)
11. **Payment Methods Distribution** - Gateway breakdown (Shop Pay, Apple Pay, credit cards, etc.)
12. **Strategic Recommendations Summary** - Actionable insights and next steps

### Comparison Reports (9 Sections) ⭐ NEW
Side-by-side analysis for two stores:

1. **Executive Summary** - Side-by-side metrics with winner badges
2. **Daily Performance Comparison** - Launch day + decay patterns
3. **Top Products Comparison** - Top 10 for each market
4. **Multi-Item Order Analysis** - Basket size & AOV comparison
5. **Day of Week Performance** - Weekday patterns for both
6. **Peak Hours Performance** - 24-hour analysis for both
7. **Checkout Funnel & Conversion** - Funnel comparison (includes Add to Cart when data available)
8. **Payment Methods** - Payment landscape differences (critical insight!)
9. **TL;DR Executive Summary** - Key findings & recommendations

**💡 Tip:** Comparison reports are particularly valuable when you discover a merchant operates multiple store IDs across different markets. After completing the individual store analysis, generate a comparison report to identify performance differences and optimization opportunities across their store network.

## 🎯 Key v5.1 Improvements

### 1. Data Availability Protocol
- **Default Assumption:** ALL data is available
- **Mandatory Workflow:** `get_entry_metadata` → Study errors → Test iteratively
- **No More "Data Unavailable" Notes** (except headless session data)

### 2. New Queries Added
- **Query 10A:** Multi-Item Order Distribution
- **Query 10B:** Top Product Combinations (reveals natural bundles)
- **Query 10C:** Customer Segmentation by Order Value
- **Query 11A:** Hourly Performance (24-hour view)

### 3. Product Combination Analysis
- Identifies most popular product pairings
- Reveals natural product affinity
- Enables data-driven bundle recommendations
- Shows % of multi-item orders for each combo

### 4. Enhanced Customer Insights
- 5-tier value segmentation
- Revenue concentration analysis
- Targeted marketing strategies per tier

### 5. Dual-Currency Reporting
- **Generate two reports:** Original USD + Converted currency (EUR, GBP, CAD, etc.)
- **Automatic conversion:** All monetary values converted using event-date exchange rate
- **Complete reports:** Both versions include all 10 sections, charts, and recommendations
- **Metadata included:** Exchange rate and conversion date documented in report footer
- **Use cases:** European merchants, multi-market operations, executive presentations in local currency

### 6. Chart.js Configuration (CRITICAL for PDF)
- **Bar/Line charts:** Use `maintainAspectRatio: false` to allow full-width rendering
- **Pie/Doughnut charts:** Use `maintainAspectRatio: true` to keep circular shape in PDF
- **CRITICAL:** This single setting difference ensures pie charts stay round while bar charts remain readable

**Example - Bar Chart:**
```javascript
new Chart(ctx, {
    type: 'bar',
    data: { ... },
    options: {
        responsive: true,
        maintainAspectRatio: false,  // ← Full width
        ...
    }
});
```

**Example - Pie/Doughnut Chart:**
```javascript
new Chart(ctx, {
    type: 'pie', // or 'doughnut'
    data: { ... },
    options: {
        responsive: true,
        maintainAspectRatio: true,  // ← Stays circular
        ...
    }
});
```

### 7. Sales Channel Performance Analysis
- **Complete channel breakdown:** Web vs Mobile App vs POS vs Draft Orders
- **AOV comparison:** Identifies premium channels (e.g., app users spend 34% more)
- **Revenue attribution:** Shows channel contribution to total revenue
- **Optimization strategies:** Channel-specific recommendations for growth
- **CRITICAL:** Always runs Query 1D to avoid missing app/POS revenue

### 8. Report Header Styling (REQUIRED)

All header text must be white to ensure visibility on the gradient background:

```css
header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    border-radius: 12px;
    /* ... other styling ... */
}

.meta-label {
    opacity: 0.8;
    font-weight: 500;
    color: white;  /* ← REQUIRED: Ensures label text is white */
}

.meta-item {
    font-size: 0.95em;
    color: white;  /* ← REQUIRED: Ensures all metadata text is white */
}
```

**CRITICAL:** Without explicit `color: white;` on `.meta-label` and `.meta-item`, the text will render in grey (inheriting from body color) instead of white, making it hard to read on the purple gradient.

### 9. PDF-Friendly Styling

#### Text & Colors
- **ALL text must be black (#000 or #333)** - This includes data values, paragraphs, headers, insights, recommendations, and table text
- **White backgrounds on ALL cards and boxes** - No gradients (they render grey in PDF)
- **Border-based visual separation** - Use colored borders instead of background gradients
- **Specific requirements:**
  - `body { color: #000; }` - Base text color must be black
  - Metric cards: `background: white; border: 2px solid [color];`
  - Insight/recommendation boxes: `background: white; border: 2px solid [color]; color: #000;`
  - All paragraphs: `color: #000;`
  - All table text: `color: #000;`

#### Print Media Query (REQUIRED)
Add this `@media print` block to compress spacing for PDF:

```css
@media print {
    @page {
        margin: 0.5in;
        size: letter;
    }
    
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    /* Header - Compact but keep all info visible */
    header {
        padding: 15px 20px !important;
        margin-bottom: 10px !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        height: auto !important;
        min-height: auto !important;
    }
    
    header h1 { font-size: 1.4em !important; margin-bottom: 3px !important; }
    .subtitle { font-size: 0.9em !important; margin-bottom: 5px !important; }
    .shopify-logo { width: 28px !important; height: 28px !important; top: 12px !important; left: 15px !important; }
    .report-meta { 
        margin-top: 8px !important;
        padding-top: 8px !important;
        gap: 5px !important;
        font-size: 0.75em !important;
    }
    .meta-item { font-size: 0.8em !important; }
    .data-driven-badge { 
        margin-top: 8px !important;
        padding: 4px 10px !important;
        font-size: 0.75em !important;
    }
    
    /* Sections - reduce padding & margins */
    .section {
        padding: 20px !important;
        margin-bottom: 15px !important;
        box-shadow: none !important;
        border: 1px solid #e0e0e0 !important;
    }
    
    /* Keep Executive Summary with header on page 1 */
    .section:first-of-type {
        page-break-before: avoid !important;
        page-break-inside: auto !important;
    }
    
    .section h2 { font-size: 1.5em !important; margin-bottom: 15px !important; }
    .section h3 { 
        font-size: 1.2em !important;
        margin-top: 25px !important;
        margin-bottom: 12px !important;
        clear: both !important;
    }
    .chart-container + h3,
    .chart-container ~ h3 { margin-top: 35px !important; }
    .section p { margin-bottom: 12px !important; font-size: 0.95em !important; }
    
    /* Metrics - maintain 3-column grid layout */
    .metrics-grid { 
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 10px !important;
        margin-bottom: 15px !important;
    }
    .metric-card { 
        padding: 12px !important;
        box-shadow: none !important;
        page-break-inside: avoid !important;
    }
    .metric-value { font-size: 1.8em !important; margin: 8px 0 !important; }
    .metric-label { font-size: 0.8em !important; }
    .metric-subtitle { font-size: 0.75em !important; }
    
    /* Charts - prevent overlap */
    .chart-container { 
        height: 280px !important;
        margin: 15px 0 30px 0 !important;
        padding-bottom: 30px !important;
        page-break-inside: avoid;
        page-break-after: avoid !important;
        clear: both;
    }
    .chart-container canvas { 
        max-height: 280px !important;
    }
    
    /* Charts maintain proper sizing in print */
    
    /* Tables - extra space after charts */
    table { 
        margin: 25px 0 15px 0 !important;
        font-size: 0.85em !important;
        page-break-inside: avoid !important;
        clear: both !important;
    }
    th, td { padding: 8px !important; }
    .chart-container + table,
    .chart-container ~ table { margin-top: 35px !important; }
    
    /* Boxes - prevent overlap with charts */
    .insight-box, .recommendation-box {
        padding: 12px 15px !important;
        margin: 20px 0 12px 0 !important;
        page-break-inside: avoid !important;
        clear: both !important;
    }
    .chart-container + h3,
    .chart-container + .insight-box,
    .chart-container + .recommendation-box {
        margin-top: 35px !important;
    }
    
    /* General */
    .container { 
        padding: 10px !important;
        max-width: 100% !important;
    }
    body { 
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    h2, h3, h4 { page-break-after: avoid; }
}
```

- **Mandatory for all reports** - Ensures consistent PDF quality and print readability

## 💡 Pro Tips

### For Best Results:
1. **Always start with schema inspection** - Don't guess field names
2. **Test queries incrementally** - Add complexity gradually
3. **Use exact table/field names** from metadata
4. **Check for nested structures** - STRUCT, ARRAY, REPEATED fields
5. **Read error messages carefully** - They often contain correct field names

### When to Use Comparison Reports:
- ✅ Same brand operating in different countries/markets
- ✅ Analyzing performance gaps between regions
- ✅ Understanding cultural differences (payment methods, shopping patterns)
- ✅ B2B vs B2C channel performance
- ✅ Pre/post migration or platform change
- ❌ Comparing unrelated brands (different products/audiences)
- ❌ Different time periods for same store (use individual report with YoY)

### Common Pitfalls to Avoid:
- ❌ Assuming data is missing without thorough investigation
- ❌ Using wrong date fields (e.g., `event_date` instead of `checkout_started_at`)
- ❌ Forgetting `UNNEST` for array fields
- ❌ Not joining with `merchandising.products` for product names
- ❌ Skipping `get_entry_metadata` before queries
- ❌ Recommending Amazon as a sales channel (NEVER do this)

### Cart & Session Data Considerations:

**Sessions in Conversion & Checkout Funnel Section (ALWAYS Include):**
- **Standard practice:** Include session analytics at the top of the Conversion & Checkout Funnel section in ALL reports
- **Conditional notes:** Add prominent context note when subscription orders >30% or session coverage <70%
- **Example note:** "This merchant has 50.1% subscription orders, which often bypass traditional session tracking. Session data represents 68% of checkout activity. Traditional 'Add to Cart' events are not tracked due to the subscription-heavy business model."
- **Structure:**
  - **H3: "Session Performance"** - Session metrics grid (6 cards)
  - **H3: "Checkout Funnel Performance"** - Funnel visualization and metrics
  - **Combined insights** - Merge session + funnel insights (explain dual conversion rates: 62.4% session vs 43.5% checkout)
  - **Combined recommendations** - Integrated optimization strategies
- **Key session metrics to include:**
  - Total sessions (tracked visitor sessions)
  - Converting sessions (sessions with purchase)
  - Session conversion rate (% of sessions that convert)
  - Session coverage (% of checkouts with session tracking)
  - Average order value from tracked sessions
  - Orders tracked vs total orders

**Add to Cart Tracking:**
- Check `has_cart_information` field in checkouts_summary
- If 0% coverage: Subscription-heavy merchants or custom checkout implementations may not track this
- Document in report: "Cart data not available due to [subscription model/custom implementation]"

**Checkout Funnel Progression (from `checkouts_summary`):**
- Use `contact_information_attributes.contact_information_progression_count` for Contact Info step
- Use `shipping_attributes.shipping_progression_count` for Shipping step
- Use `payment_attributes.payment_progression_count` for Payment step
- Use `is_checkout_completed` for Completion
- **Note:** Completion rate may exceed payment rate due to express wallets (Shop Pay, Apple Pay) bypassing traditional funnel
- Query by `checkout_chain_token_index` and filter `is_real_buyer_intent_checkout = TRUE`

**Payment Methods (CRITICAL - Use Correct Field):**
- ✅ **CORRECT:** Use `payment_methods` field → Shows Shop Pay, Apple Pay, Google Pay, credit cards, PayPal, etc.
- ❌ **WRONG:** Using `gateway_names__checkout_completed` → Only shows gateway names like "shopify_payments", not actual payment types
- **Why it matters:** Merchants need to see express wallet adoption (Shop Pay 36%, Apple Pay 30%) vs traditional cards
- **Query:** `UNNEST(cs.payment_methods) as pm` from `checkouts_summary` table

**Session Coverage Interpretation:**
- **80%+ coverage:** Full session attribution available, standard analysis
- **50-79% coverage:** Partial tracking, likely subscription/API orders - include note about subscription impact
- **<50% coverage:** May be headless merchant or heavy API integration - add stronger disclaimer

**Funnel Flexibility:**
- Start funnel at "Checkout Started" when cart data unavailable
- Still provides valuable conversion insights (43.5% is above e-commerce average)
- Session-level conversion (62.4%) vs checkout-level conversion (43.5%) tell different stories

## 📁 Original Files Location
Original files remain in: `/Users/mayamarks/QBR:MBR/`

## 📞 Support
For issues or questions about:
- **Data Platform MCP:** #data-portal-mcp on Slack
- **Report Generation:** Refer to instruction document Section 1

## 🎉 Success Stories

### Veralab Report
- Discovered 8.79% of multi-item orders buy OLIO DENSO + SPUMONE combo
- Identified SPUMONE as complementary hero product (appears in 2 of top 5 combos)
- Revealed 96.77% multi-item rate (exceptional for skincare)

### Lounge Report
- Found 12.39% of multi-item orders buy Blossom Smaragdgrün matching set
- Identified Blossom collection outsells Flirt by 4:1
- Discovered 94.40% multi-item rate with 35.66% buying 6+ items

---

**Version:** 5.1  
**Last Updated:** November 20, 2025  
**Total Queries:** 40+  
**Individual Report Sections:** 11  
**Comparison Report Sections:** 9  
**Report Templates:** 2 (Individual + Comparison)

