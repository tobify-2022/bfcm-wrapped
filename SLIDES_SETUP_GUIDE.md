# 🎨 **Google Slides Generation Setup Guide**

Automatic generation of professional Google Slides presentations from BFCM report data using Revenue MCP.

---

## 📋 **Prerequisites**

1. ✅ Revenue MCP configured in Cursor
2. ✅ Google OAuth with Drive/Slides permissions
3. ✅ Google Slides template created

---

## 🏗️ **Step-by-Step Setup**

### **Step 1: Create Your Google Slides Template**

1. Go to [Google Slides](https://slides.google.com)
2. Create a new presentation
3. Design your slides with placeholders using `{{variable_name}}` syntax

#### **Example Template Structure:**

```
Slide 1 (Cover):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 BFCM {{bfcm_year}} WRAPPED
  
  {{merchant_name}}
  
  {{date_range}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 2 (Performance Snapshot):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 PERFORMANCE SNAPSHOT
  
  Total GMV: {{total_gmv}}
  Total Orders: {{total_orders}}
  Average Order Value: {{aov}}
  
  🚀 Growth vs 2024:
  GMV: {{gmv_growth}}
  Orders: {{orders_growth}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 3 (Top Products):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏆 TOP PRODUCTS
  
  1. {{product_1_name}} - {{product_1_revenue}}
  2. {{product_2_name}} - {{product_2_revenue}}
  3. {{product_3_name}} - {{product_3_revenue}}
  4. {{product_4_name}} - {{product_4_revenue}}
  5. {{product_5_name}} - {{product_5_revenue}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 4 (Customer Insights):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👥 CUSTOMER INSIGHTS
  
  Total Customers: {{total_customers}}
  New: {{new_customers}} ({{new_customer_pct}})
  Returning: {{returning_customers}} ({{returning_customer_pct}})
  
  💎 Top Customer:
  Spent {{top_customer_spend}} across {{top_customer_orders}} orders
  
  🛍️ Shop Pay Usage: {{shop_pay_pct}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 5 (Channel Performance):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📱 CHANNEL BREAKDOWN
  
  Online: {{online_gmv}} ({{online_growth}})
  POS: {{pos_gmv}} ({{pos_growth}})
  B2B: {{b2b_gmv}} ({{b2b_growth}})
  Shop: {{shop_gmv}} ({{shop_growth}})
  
  🏆 Top Channel: {{top_channel}}
  Revenue: {{top_channel_gmv}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 6 (Conversion Funnel):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔄 CONVERSION METRICS
  
  Sessions: {{total_sessions}}
  Conversion Rate: {{conversion_rate}}
  Cart → Checkout: {{cart_to_checkout_rate}}
  
  📱 Device Breakdown:
  Mobile: {{mobile_pct}}
  Desktop: {{desktop_pct}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 7 (Retail Performance):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏪 RETAIL PERFORMANCE
  
  Total Retail GMV: {{retail_gmv}}
  Retail Orders: {{retail_orders}}
  Retail AOV: {{retail_aov}}
  
  🌟 Top Location: {{top_location}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 8 (Discounts & Pricing):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💰 PRICING STRATEGY
  
  Full Price Sales: {{full_price_gmv}}
  Discounted Sales: {{discounted_gmv}}
  
  Discount Rate: {{discount_pct}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 9 (International Sales):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌍 INTERNATIONAL REACH
  
  Cross-Border GMV: {{international_gmv}}
  International %: {{international_pct}}
  
  Units Per Transaction: {{upt}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 10 (Multi-Store Breakdown):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏬 STORE PERFORMANCE
  
  {{store_1_name}}: {{store_1_gmv}}
  {{store_2_name}}: {{store_2_gmv}}
  {{store_3_name}}: {{store_3_gmv}}
  {{store_4_name}}: {{store_4_gmv}}
  {{store_5_name}}: {{store_5_gmv}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slide 11 (Key Takeaways):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✨ KEY HIGHLIGHTS
  
  🚀 {{gmv_growth}} growth in GMV
  📈 {{orders_growth}} increase in orders
  💎 {{returning_customer_pct}} returning customers
  🌍 {{international_pct}} international sales
  
  Generated: {{report_date}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. **Save your template** and note the Template ID from the URL:
   ```
   https://docs.google.com/presentation/d/{TEMPLATE_ID}/edit
   ```

---

### **Step 2: Configure Template ID**

Open `client/src/lib/revenue-mcp-slides.ts` and set your template ID:

```typescript
const DEFAULT_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';
```

---

### **Step 3: Add UI Button for Slide Generation**

The slide generation is triggered after report generation. You can add a button in `ReportPreview.tsx`:

```typescript
<button 
  onClick={handleGenerateSlides}
  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
>
  📊 Generate Slides
</button>
```

---

## 📊 **Available Template Variables**

### **Basic Info**
- `{{merchant_name}}` - Account name
- `{{bfcm_year}}` - Year (2025)
- `{{report_date}}` - Report generation date
- `{{date_range}}` - Date range analyzed

### **Performance Metrics (2025)**
- `{{total_gmv}}` - Total GMV (formatted)
- `{{total_gmv_raw}}` - Total GMV (raw number)
- `{{total_orders}}` - Total orders
- `{{total_orders_raw}}` - Total orders (raw)
- `{{aov}}` - Average order value
- `{{aov_raw}}` - AOV (raw)

### **Comparison (2024)**
- `{{total_gmv_2024}}` - 2024 GMV
- `{{total_orders_2024}}` - 2024 Orders
- `{{aov_2024}}` - 2024 AOV

### **Growth**
- `{{gmv_growth}}` - GMV growth % (formatted)
- `{{gmv_growth_raw}}` - GMV growth % (number)
- `{{orders_growth}}` - Orders growth %
- `{{orders_growth_raw}}` - Orders growth % (number)

### **Peak Performance**
- `{{peak_gmv}}` - Peak GMV per minute
- `{{peak_minute}}` - Peak minute timestamp

### **Top Products** (1-10)
- `{{product_1_name}}` through `{{product_10_name}}`
- `{{product_1_revenue}}` through `{{product_10_revenue}}`
- `{{product_1_units}}` through `{{product_10_units}}`

### **Customer Insights**
- `{{new_customers}}` - New customer count
- `{{returning_customers}}` - Returning customer count
- `{{total_customers}}` - Total customers
- `{{returning_customer_pct}}` - % returning
- `{{new_customer_pct}}` - % new
- `{{top_customer_spend}}` - Top customer spend
- `{{top_customer_orders}}` - Top customer order count
- `{{shop_pay_orders}}` - Shop Pay orders
- `{{shop_pay_pct}}` - Shop Pay %

### **Channel Performance**
- `{{online_gmv}}`, `{{online_orders}}`, `{{online_growth}}`
- `{{pos_gmv}}`, `{{pos_orders}}`, `{{pos_growth}}`
- `{{b2b_gmv}}`, `{{b2b_orders}}`, `{{b2b_growth}}`
- `{{shop_gmv}}`, `{{shop_orders}}`, `{{shop_growth}}`
- `{{top_channel}}` - Best performing channel
- `{{top_channel_gmv}}` - Top channel revenue

### **Retail Metrics**
- `{{retail_gmv}}` - Retail GMV
- `{{retail_orders}}` - Retail orders
- `{{retail_aov}}` - Retail AOV
- `{{top_location}}` - Best performing location

### **Conversion**
- `{{conversion_rate}}` - Overall conversion rate
- `{{total_sessions}}` - Total sessions
- `{{cart_to_checkout_rate}}` - Cart→Checkout rate
- `{{mobile_sessions}}`, `{{desktop_sessions}}`
- `{{mobile_pct}}` - Mobile session %

### **Discounts**
- `{{discounted_gmv}}` - Discounted sales
- `{{full_price_gmv}}` - Full price sales
- `{{discount_pct}}` - % using discounts

### **International**
- `{{international_gmv}}` - Cross-border GMV
- `{{international_pct}}` - % international

### **Other**
- `{{upt}}` - Units per transaction
- `{{top_referrer}}` - Top referrer source
- `{{referrer_gmv}}` - Referrer GMV

### **Multi-Store** (1-10)
- `{{store_1_name}}` through `{{store_10_name}}`
- `{{store_1_gmv}}` through `{{store_10_gmv}}`
- `{{store_1_orders}}` through `{{store_10_orders}}`
- `{{store_1_aov}}` through `{{store_10_aov}}`

---

## 🚀 **Usage**

### **Generate Slides from Report Data**

```typescript
import { generateBFCMSlides, previewReplacements } from '@/lib/revenue-mcp-slides';

// Preview what will be replaced (for debugging)
previewReplacements(reportData);

// Generate slides
const result = await generateBFCMSlides(reportData);

if (result.success) {
  console.log('✅ Slides created!');
  console.log('📊 URL:', result.presentation_url);
  console.log('📄 Slides:', result.slides_count);
  
  // Open in new tab
  window.open(result.presentation_url, '_blank');
} else {
  console.error('❌ Error:', result.error);
}
```

### **With Custom Title**

```typescript
const result = await generateBFCMSlides(
  reportData,
  undefined, // Use default template
  'Frank Green - BFCM 2025 Executive Summary'
);
```

### **With Different Template**

```typescript
const result = await generateBFCMSlides(
  reportData,
  'DIFFERENT_TEMPLATE_ID_HERE'
);
```

---

## 🎨 **Design Tips**

### **Slide Aesthetics**
1. **Use Shopify Brand Colors:**
   - Primary: #7AB55C (Green)
   - Secondary: #96BF48
   - Accent: #000000 (Black)
   - Background: #FFFFFF (White)

2. **Typography:**
   - Headlines: Bold, 48-60pt
   - Body: Regular, 24-32pt
   - Metrics: Extra Bold, 72-96pt for impact

3. **Layout:**
   - 60/40 split for data vs visuals
   - Ample white space
   - Consistent margins (80-100px)

4. **Data Visualization:**
   - Use charts/graphs where possible
   - Color-code growth (green) vs decline (red)
   - Icons for quick visual recognition

### **Slide Order Best Practices**
1. Cover (Brand + Headline)
2. Executive Summary (Top 3 metrics)
3. Performance Overview (GMV, Orders, AOV)
4. YoY Comparison
5. Top Products
6. Customer Insights
7. Channel Performance
8. Conversion Funnel
9. Retail Performance (if applicable)
10. International Sales (if applicable)
11. Key Takeaways
12. Next Steps / Thank You

---

## 🧪 **Testing**

### **1. Test Template Variables**

```typescript
import { getTemplateVariables } from '@/lib/revenue-mcp-slides';

const variables = await getTemplateVariables();
console.log('Template variables:', variables);
```

### **2. Preview Replacements**

```typescript
import { previewReplacements } from '@/lib/revenue-mcp-slides';

previewReplacements(yourReportData);
// Check console for variable → value mappings
```

### **3. Generate Test Slides**

Use a test merchant with known data to verify all placeholders are filled correctly.

---

## 🐛 **Troubleshooting**

### **Error: Template ID not configured**
- Set `DEFAULT_TEMPLATE_ID` in `revenue-mcp-slides.ts`

### **Error: Failed to fetch template variables**
- Verify Revenue MCP is configured
- Check Google OAuth permissions include Drive/Slides
- Verify template ID is correct

### **Variables not replaced**
- Ensure `{{variable}}` syntax is exact (no extra spaces)
- Check variable name matches available keys
- Use `previewReplacements()` to see all available variables

### **Missing data in slides**
- Some metrics may be `N/A` if no data exists
- Check report data has all required fields
- Review `buildReplacements()` function for logic

---

## 📚 **Next Steps**

1. ✅ Create your template
2. ✅ Configure template ID
3. ✅ Test with sample data
4. ✅ Refine design
5. ✅ Deploy to production
6. 🎉 Generate slides for every BFCM report!

---

## 🔗 **Resources**

- [Revenue MCP Documentation](https://vault.shopify.io/)
- [Google Slides API](https://developers.google.com/slides)
- [Quick Sites Docs](https://quick.shopify.io/docs.html)

---

**Questions?** Check `#help-revenue-funnel` or `#data-portal-mcp` in Slack.

