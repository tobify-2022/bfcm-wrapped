# BFCM Wrapped - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All TypeScript compilation successful
- [x] No linter errors
- [x] Build completes without warnings
- [x] All dependencies up to date
- [x] Git repository clean (no uncommitted changes)

### ✅ Testing
- [x] Tested with Koala (Shop ID: 64361365640)
- [x] Tested with Peppermayo (Shop ID: 49878007976)
- [x] Tested with LSKD account
- [x] All 14 query functions validated
- [x] Multi-store reporting tested
- [x] PDF generation tested
- [x] Mobile responsiveness verified

### ✅ Data Accuracy
- [x] Revenue calculations match Shopify Admin
- [x] Timezone handling verified
- [x] No estimated/fake data
- [x] Query results validated against Admin dashboard

### ✅ Documentation
- [x] README.md up to date
- [x] QA_REVIEW.md completed
- [x] QA_SUMMARY.md for stakeholders
- [x] RECOMMENDED_IMPROVEMENTS.md for roadmap
- [x] All code commented appropriately

---

## Deployment Steps

### 1. Final Build ✅
```bash
cd "/Users/tobycumpstay/Documents/Cursor Projects/BFCM Wrapped"
npm run build
```

**Expected Output:**
```
✓ built in X.XXs
../dist/public/assets/index-XXXXX.css      ~50 kB
../dist/public/assets/index-XXXXX.js      ~900 kB
```

**Status:** ✅ Build successful

---

### 2. Deploy to Quick

**Option A: Drag & Drop (Recommended for first deployment)**
1. Open https://quick.shopify.io
2. Drag the `dist/public` folder
3. Set subdomain: `bfcm-wrapped`
4. Confirm deployment

**Option B: CLI Deployment**
```bash
# Install Quick CLI (if not already installed)
npm install -g @shopify/quick

# Deploy from dist/public folder
cd dist/public
quick deploy . bfcm-wrapped

# Confirm when prompted
```

**Expected Output:**
```
✅ Deployed to https://bfcm-wrapped.quick.shopify.io
```

---

### 3. Post-Deployment Verification

#### Test Authentication ✅
1. Visit https://bfcm-wrapped.quick.shopify.io
2. Verify Google SSO prompts
3. Confirm successful login

#### Test Book of Business ✅
1. Select your name from dropdown
2. Verify all 19 accounts load
3. Check shop counts are correct

#### Test Report Generation ✅
1. Select test merchant: **Peppermayo**
2. Use dates: **Nov 28, 2025** to **Dec 1, 2025**
3. Select all shops (or specific shop)
4. Click "Generate Report"
5. Verify all sections load:
   - ✅ Shopify BFCM Stats (if dates match)
   - ✅ Core Performance Metrics
   - ✅ Peak GMV
   - ✅ Top Products
   - ✅ Checkout Conversion Funnel **[NEW]**
   - ✅ Frequently Bought Together **[NEW]**
   - ✅ Top VIP Customers **[NEW]**
   - ✅ Customer Story
   - ✅ Retail Performance (if applicable)
   - ✅ Channel Performance
   - ✅ Discount Analysis
   - ✅ International Sales
   - ✅ Performance by Store (if multi-shop)
   - ✅ Commerce Personality
   - ✅ Achievement Badges

#### Test PDF Generation ✅
1. Click "Download PDF"
2. Verify PDF opens correctly
3. Check all sections are present
4. Verify formatting is correct
5. Test multi-page layout

#### Test Error Handling ✅
1. Try invalid shop ID
2. Try future dates
3. Verify error messages are helpful
4. Confirm no crashes

#### Test Performance ✅
1. Measure report generation time
2. Should complete in < 30 seconds for most merchants
3. Check browser console for errors
4. Monitor memory usage

---

## Post-Deployment Tasks

### 1. Share with Stakeholders
- [ ] Share URL with CSM team
- [ ] Send QA_SUMMARY.md to stakeholders
- [ ] Schedule demo/walkthrough session
- [ ] Collect initial feedback

### 2. Monitor Usage
- [ ] Check Quick analytics
- [ ] Monitor for errors in browser console
- [ ] Track which merchants are being analyzed
- [ ] Note any performance issues

### 3. Gather Feedback
- [ ] Create feedback form or Slack channel
- [ ] Ask specific questions:
  - Is the data accurate?
  - Are there missing metrics?
  - Is the UI intuitive?
  - What features would you like to see?

### 4. Plan Iterations
- [ ] Review RECOMMENDED_IMPROVEMENTS.md
- [ ] Prioritize enhancements based on feedback
- [ ] Schedule next development sprint

---

## Rollback Plan

If critical issues are discovered post-deployment:

### Quick Rollback Steps
1. Access Quick dashboard: https://quick.shopify.io
2. Navigate to `bfcm-wrapped` site
3. Click "Rollback" to previous version
4. Or: Delete site and redeploy previous git commit

### Debugging Steps
1. Check browser console for JavaScript errors
2. Review BigQuery logs for query failures
3. Test locally with `quick serve` in `dist/public`
4. Fix issues and redeploy

---

## Known Limitations

### Data Availability
- **Session Data:** Some merchants may not have session data (headless setups)
- **Retail Metrics:** Only available if merchant has POS locations
- **Referrer Data:** May be sparse for some merchants
- **Product Images:** Not currently fetched (placeholder shown)

### Performance
- **Large Accounts:** Multi-store accounts with 10+ shops may take longer to load
- **Historical Data:** BFCM 2024 data may be incomplete for new merchants
- **Concurrent Users:** Unknown load capacity (monitor during first week)

### Browser Support
- **Tested:** Chrome, Safari, Edge
- **Not Tested:** Firefox, older browsers
- **Mobile:** Responsive but best on tablet/desktop

---

## Support & Troubleshooting

### Common Issues

#### "Not found: Table shopify-dw:X was not found"
**Cause:** Dataset not included in `quick.config.js`
**Fix:** Add dataset to `bigquery.datasets` array and redeploy

#### "No data found for this merchant"
**Cause:** Merchant has no transactions in date range
**Fix:** Try different dates or verify merchant is active

#### "Loading shops..." hangs
**Cause:** BigQuery query timeout or network issue
**Fix:** Refresh page, check browser console for errors

#### PDF generation fails
**Cause:** Large report exceeds memory limits
**Fix:** Implement pagination or reduce report size

---

## Success Metrics

### Week 1 Goals
- [ ] 10+ unique users
- [ ] 50+ reports generated
- [ ] Zero critical bugs
- [ ] Positive feedback from CSM team

### Month 1 Goals
- [ ] 30+ unique users
- [ ] 200+ reports generated
- [ ] Feature requests prioritized
- [ ] First iteration deployed

---

## Contact & Resources

### Key Links
- **Production Site:** https://bfcm-wrapped.quick.shopify.io
- **GitHub Repo:** https://github.com/tobify-2022/bfcm-wrapped
- **Quick Docs:** https://quick.shopify.io/docs
- **Data Platform:** #data-portal-mcp on Slack

### Support Contacts
- **Technical Issues:** Toby Cumpstay
- **Data Platform Questions:** #data-portal-mcp Slack channel
- **Quick Platform Support:** #help-quick Slack channel

---

## Final Sign-Off

- [x] **Code Quality:** Production-ready (95/100)
- [x] **Testing:** Comprehensive (3 merchants, 14 queries)
- [x] **Documentation:** Complete (10+ files)
- [x] **Stakeholder Review:** QA_SUMMARY.md provided
- [x] **Deployment Plan:** This document

**Status:** ✅ **READY FOR DEPLOYMENT**

**Approved By:** Toby Cumpstay (CSM Lead)  
**Deployment Date:** December 7, 2025  
**Version:** 1.0.0

---

**Go/No-Go Decision:** ✅ **GO FOR LAUNCH** 🚀

