# 🎨 Revenue MCP - Google Slides Integration

**Automatic Google Slides Presentation Generation for BFCM Reports**

---

## ✅ **What's Been Implemented**

### **1. Core Library** (`client/src/lib/revenue-mcp-slides.ts`)
- ✅ `getTemplateVariables()` - Fetch all `{{placeholders}}` from template
- ✅ `generateBFCMSlides()` - Create slides with data replacement
- ✅ `buildReplacements()` - Map ReportData → template variables
- ✅ `previewReplacements()` - Debug console output
- ✅ **100+ template variables** automatically mapped

### **2. UI Integration** (`client/src/components/report/ReportPreview.tsx`)
- ✅ "Generate Slides" button added next to "Download PDF"
- ✅ Loading state with spinner
- ✅ Success state with checkmark
- ✅ Auto-opens generated slides in new tab
- ✅ Error handling with user-friendly messages

### **3. Documentation**
- ✅ `SLIDES_SETUP_GUIDE.md` - Complete setup instructions
- ✅ Template variable reference (all 100+ variables documented)
- ✅ Example slide layouts
- ✅ Design guidelines
- ✅ Troubleshooting guide

---

## 📊 **Available Template Variables (100+)**

### **Core Metrics**
```
{{merchant_name}}          {{bfcm_year}}              {{report_date}}
{{date_range}}             {{total_gmv}}              {{total_orders}}
{{aov}}                    {{gmv_growth}}             {{orders_growth}}
```

### **Products (1-10)**
```
{{product_1_name}}         {{product_1_revenue}}      {{product_1_units}}
{{product_2_name}}         {{product_2_revenue}}      {{product_2_units}}
... up to product_10
```

### **Customers**
```
{{new_customers}}          {{returning_customers}}    {{total_customers}}
{{returning_customer_pct}} {{top_customer_spend}}     {{top_customer_orders}}
{{shop_pay_orders}}        {{shop_pay_pct}}
```

### **Channels**
```
{{online_gmv}}            {{online_orders}}          {{online_growth}}
{{pos_gmv}}               {{pos_orders}}             {{pos_growth}}
{{b2b_gmv}}               {{b2b_orders}}             {{b2b_growth}}
{{shop_gmv}}              {{shop_orders}}            {{shop_growth}}
{{top_channel}}           {{top_channel_gmv}}
```

### **Conversion**
```
{{conversion_rate}}        {{total_sessions}}         {{cart_to_checkout_rate}}
{{mobile_sessions}}        {{desktop_sessions}}       {{mobile_pct}}
```

### **Retail**
```
{{retail_gmv}}             {{retail_orders}}          {{retail_aov}}
{{top_location}}
```

### **Discounts & International**
```
{{discounted_gmv}}         {{full_price_gmv}}         {{discount_pct}}
{{international_gmv}}      {{international_pct}}      {{upt}}
```

### **Multi-Store (1-10)**
```
{{store_1_name}}           {{store_1_gmv}}            {{store_1_orders}}
{{store_1_aov}}
... up to store_10
```

**See `SLIDES_SETUP_GUIDE.md` for complete list**

---

## 🚀 **Quick Start**

### **Step 1: Create Template**
1. Go to [Google Slides](https://slides.google.com)
2. Create new presentation
3. Design slides with `{{variable}}` placeholders
4. Copy template ID from URL

### **Step 2: Configure**
```typescript
// client/src/lib/revenue-mcp-slides.ts
const DEFAULT_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';
```

### **Step 3: Generate Slides**
1. Generate BFCM report
2. Click **"Generate Slides"** button
3. Slides automatically created and opened

---

## 🎨 **Example Slide Template**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slide 1: COVER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          🎉 BFCM {{bfcm_year}} WRAPPED
          
          {{merchant_name}}
          
          {{date_range}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slide 2: PERFORMANCE SNAPSHOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          📊 PERFORMANCE OVERVIEW
          
          💰 Total GMV: {{total_gmv}}
          🛒 Total Orders: {{total_orders}}
          📦 Average Order: {{aov}}
          
          🚀 YoY Growth:
          GMV: {{gmv_growth}} | Orders: {{orders_growth}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slide 3: TOP PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          🏆 BEST SELLERS
          
          1. {{product_1_name}} - {{product_1_revenue}}
          2. {{product_2_name}} - {{product_2_revenue}}
          3. {{product_3_name}} - {{product_3_revenue}}
          4. {{product_4_name}} - {{product_4_revenue}}
          5. {{product_5_name}} - {{product_5_revenue}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slide 4: CUSTOMER INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          👥 YOUR CUSTOMERS
          
          Total: {{total_customers}}
          New: {{new_customers}} ({{new_customer_pct}})
          Returning: {{returning_customers}} ({{returning_customer_pct}})
          
          💎 Top Spender: {{top_customer_spend}}
          across {{top_customer_orders}} orders
          
          🛍️ Shop Pay: {{shop_pay_pct}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 **Technical Architecture**

### **Data Flow**
```
ReportData (Home.tsx)
     ↓
generateBFCMSlides() (revenue-mcp-slides.ts)
     ↓
buildReplacements() → Creates variable map
     ↓
Revenue MCP API
     ↓
Google Slides API
     ↓
New Presentation URL
```

### **Key Functions**

#### **`generateBFCMSlides(reportData, templateId?, customTitle?)`**
```typescript
const result = await generateBFCMSlides(data);

// Returns:
{
  success: true,
  presentation_id: "1abc...",
  presentation_url: "https://docs.google.com/...",
  title: "Merchant Name - BFCM 2025 Report",
  slides_count: 11
}
```

#### **`buildReplacements(reportData)`**
```typescript
// Automatically maps all ReportData fields to template variables
const replacements = {
  merchant_name: "Frank Green",
  total_gmv: "$1,234,567",
  total_orders: "5,432",
  // ... 100+ more variables
};
```

#### **`previewReplacements(reportData)`**
```typescript
// Logs all variable → value mappings to console
previewReplacements(data);

// Output:
// {{merchant_name}} → Frank Green
// {{total_gmv}} → $1,234,567
// ... (continues for all variables)
```

---

## 🎯 **Use Cases**

### **1. Executive Presentations**
- Generate professional slides for leadership reviews
- Share with stakeholders
- Present at QBRs

### **2. Merchant-Facing Reports**
- Create branded presentations for merchants
- Share BFCM performance summaries
- Highlight successes and opportunities

### **3. Team Reviews**
- Internal CSM team presentations
- Portfolio performance reviews
- Best practice sharing

### **4. Automation**
- Batch generate slides for all accounts
- Schedule automatic report generation
- Email slides to merchants

---

## 📈 **Advanced Usage**

### **Custom Titles**
```typescript
const result = await generateBFCMSlides(
  data,
  undefined, // Use default template
  'Q4 Performance Review - Executive Summary'
);
```

### **Multiple Templates**
```typescript
// Executive template
const execSlides = await generateBFCMSlides(data, 'EXEC_TEMPLATE_ID');

// Merchant-facing template
const merchantSlides = await generateBFCMSlides(data, 'MERCHANT_TEMPLATE_ID');

// Internal template
const internalSlides = await generateBFCMSlides(data, 'INTERNAL_TEMPLATE_ID');
```

### **Batch Generation**
```typescript
// Generate slides for all accounts in Book of Business
for (const account of bookOfBusiness) {
  const reportData = await generateReport(account);
  const slides = await generateBFCMSlides(reportData);
  console.log(`✅ Generated slides for ${account.name}: ${slides.presentation_url}`);
}
```

---

## 🐛 **Troubleshooting**

### **"Template ID not configured"**
**Solution:** Set `DEFAULT_TEMPLATE_ID` in `revenue-mcp-slides.ts`

### **"Failed to fetch template variables"**
**Possible causes:**
- Revenue MCP not configured
- Google OAuth permissions missing
- Invalid template ID

**Solution:** Verify Revenue MCP setup and Google authentication

### **Variables Not Replaced**
**Check:**
- Exact `{{variable}}` syntax (no extra spaces)
- Variable name matches available keys
- Run `previewReplacements()` to see all variables

### **Missing Data in Slides**
- Some metrics show "N/A" if no data exists
- Check report data completeness
- Review `buildReplacements()` logic

---

## 📚 **Resources**

- **Setup Guide:** `SLIDES_SETUP_GUIDE.md`
- **Revenue MCP Docs:** [Vault](https://vault.shopify.io/)
- **Google Slides API:** [developers.google.com/slides](https://developers.google.com/slides)
- **Quick Sites Docs:** [quick.shopify.io](https://quick.shopify.io/docs.html)

---

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] Multi-template support in UI dropdown
- [ ] Slide preview before generation
- [ ] Email slides directly to merchants
- [ ] Batch generation UI
- [ ] Custom branding per merchant
- [ ] Theme selection (light/dark mode)
- [ ] Chart/graph embedding
- [ ] Video walkthrough generation

### **Template Ideas**
- Executive Summary (5 slides)
- Full Performance Review (15+ slides)
- Merchant-Facing Report (branded)
- Internal Team Review
- Board Presentation
- Customer Success Story

---

## 🤝 **Support**

Need help?
- **Technical:** #help-revenue-funnel
- **Data:** #data-portal-mcp
- **Quick Sites:** #help-quick

---

## ✨ **Example Output**

After generating slides, you'll get:
1. ✅ Professional Google Slides presentation
2. 📊 All metrics automatically populated
3. 🎨 Branded with your template design
4. 🔗 Shareable URL
5. ✏️ Editable in Google Slides

**Generated slides are fully editable** - you can:
- Refine wording
- Add custom commentary
- Insert additional charts
- Adjust layouts
- Share with stakeholders

---

**Ready to generate amazing slide decks from your BFCM data! 🚀**

