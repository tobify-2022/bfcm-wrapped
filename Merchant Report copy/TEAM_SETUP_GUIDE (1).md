# 🚀 Team Setup Guide: Merchant Analysis Reports v5.1

## 📦 What to Share with Your Team

Share these files from the `Merchant_Analysis_Reports_v5.1` folder:

### Required Files:
1. **`TEAM_SETUP_GUIDE.md`** (this file) - Complete setup instructions
2. **`README.md`** - System documentation and reference
3. **`Reptiles_By_Post_Nov16-23_2025_Sales_Analysis_CORRECTED.html`** - Example report with correct formulas
4. **`Loop_Earplugs_Nov18-25_2025_Sales_Analysis.html`** - Example report (larger merchant)

### Optional (for reference):
- `Lounge_Nov16-20_2025_Sales_Analysis.html` - Multi-store example
- `Veralab_Nov3-9_2025_Sales_Analysis.html` - International merchant example

---

## 🛠️ Required MCP Servers

You need these MCP servers configured in Cursor:

1. **Data Portal MCP** (Required) - Access to Shopify's Data Platform
   - Contact: #data-portal-mcp on Slack for setup

2. **Google Workspace MCP** (Optional) - For reading existing reports from Drive
   - Helpful but not required

### Workspace Setup (One-Time)
1. Create a folder: `Merchant_Analysis_Reports`
2. Copy all 6 shared files into this folder
3. **🔑 CRITICAL: Open the folder in Cursor**
   - Go to: **File → Open Folder**
   - Select your `Merchant_Analysis_Reports` folder
   - This allows Cursor to access README.md (which contains all requirements)

**⚠️ Important:** Always have this folder open in Cursor when generating reports. The prompt references README.md, which Cursor can only read from the open workspace.

---

## 📋 How to Generate a Report

1. Open `MASTER_PROMPT.txt`
2. Fill in the 4 merchant details (name, shop ID, currency, dates)
3. Copy and paste into Cursor
4. The prompt automatically references all requirements from README.md

---

## 🎯 Quick Start Example

Example filled-in prompt from `MASTER_PROMPT.txt`:

```
I need you to generate a comprehensive sales analysis report for a Shopify merchant.

🎯 MERCHANT INFO:
- Merchant Name: BÉIS
- Shop ID: 55145791673
- Currency: USD
- Sales Event Dates: "November 22-29, 2025"

📋 Follow all requirements documented in README.md including:
- Revenue formulas (Shopify Admin calculations)
- Required data tables and fields
- Section order (12 sections)
- PDF-friendly styling
- No estimates/fake data - query Shopify Data Platform only

Use the example reports (Reptiles_By_Post, Loop_Earplugs) as templates for structure and styling.
```

---

## ✅ Quality Control Checklist

After the report is generated, verify:

- [ ] **Total Sales** matches Shopify Admin (within $100 or 1% variance)
- [ ] **AOV** = (Gross Sales + Discounts) / Orders
- [ ] All **product names** are shown (no product IDs)
- [ ] **Sales channels** show proper names (Online Store, Subscription, Shop, etc., NOT "Web" or "Channel 3890849")
- [ ] **Payment methods** show Shop Pay, Apple Pay, Google Pay (NOT just "Shopify Payments")
- [ ] **Checkout funnel** includes Contact Info → Shipping → Payment → Completed
- [ ] **Sessions data** is included with context note if needed
- [ ] **All 12 sections** are present in correct order
- [ ] **PDF formatting** works correctly (black text, round pie charts, no overlaps)
- [ ] No estimated/fake data anywhere in the report

---

## 🔧 Troubleshooting

### Problem: "Can't find README.md" or Cursor doesn't follow requirements
**Solution:** Make sure the folder is open in Cursor (File → Open Folder). Cursor needs the workspace open to access README.md.

### Problem: "Query failed" or "Table not found"
**Solution:** Make sure you're calling `get_entry_metadata` before each query to see the correct table schema and field names.

### Problem: "Total Sales doesn't match Shopify Admin"
**Solution:** Double-check you're ADDING discounts and returns (they're negative in the database):
```sql
+ SUM(oss.discounts_local)  -- Not minus!
+ SUM(oss.returns_local)    -- Not minus!
```

### Problem: "Payment methods only show 'Shopify Payments'"
**Solution:** You used the wrong field. Use:
```sql
UNNEST(cs.payment_methods) as pm  -- Correct ✅
-- NOT: UNNEST(cs.gateway_names__checkout_completed)  -- Wrong ❌
```

### Problem: "Products show as IDs, not names"
**Solution:** Join with `merchandising.products`:
```sql
JOIN `shopify-dw.merchandising.products` p
  ON olsh.product_id = p.product_id
```

### Problem: "PDF looks wrong (grey text, overlapping charts)"
**Solution:** The CSS print styles might not be applied. Reference the working example reports for correct CSS.

### Problem: "Missing checkout funnel progression"
**Solution:** Query the progression attributes from `checkouts_summary`:
```sql
contact_information_attributes.contact_information_progression_count
shipping_attributes.shipping_progression_count
payment_attributes.payment_progression_count
```

---

## 📞 Support

- **Data Platform MCP issues:** #data-portal-mcp on Slack
- **Report generation questions:** Contact the person who shared this with you
- **Example reports:** Open the included HTML files in a browser to see what reports should look like

---

## 🎓 Pro Tips

1. **Always verify revenue first:** Before generating the full report, run a quick Total Sales query and confirm it matches Shopify Admin
2. **Use example reports as templates:** Open `Reptiles_By_Post_Nov16-23_2025_Sales_Analysis_CORRECTED.html` to see correct formulas and structure
3. **Save iterations:** If you need to regenerate a report, save each version (add "_v2", "_v3") so you can compare
4. **Multi-store merchants:** If you discover a merchant has multiple store IDs (e.g., US store, UK store), generate individual reports for each store, then optionally create a comparison report
5. **PDF testing:** Always save to PDF and review before sharing - formatting issues are easier to spot in PDF view

---

## 📈 Advanced: Comparison Reports

Once you've generated individual store reports, you can create comparison reports. Use this prompt:

```
I need you to generate a comparison report between two stores for the same merchant.

🎯 STORES TO COMPARE:
- Store A: [Name], Shop ID: [ID], Dates: [dates]
- Store B: [Name], Shop ID: [ID], Dates: [dates]

Compare:
1. Business Overview (orders, revenue, AOV)
2. Daily Performance
3. Top Products (Top 10 for each)
4. Multi-Item Order Analysis
5. Day of Week Performance
6. Peak Hours Performance
7. Checkout Funnel & Conversion
8. Payment Methods
9. Geographic Performance

Use the same data requirements as individual reports (no estimates, Shopify Admin formulas, etc.)
```

---

**Version:** 5.1  
**Last Updated:** November 27, 2025  
**Questions?** Check README.md or ask in your team channel

