# Timezone Update Pattern

## Pattern to Apply to All Query Functions

### 1. Add timezone lookup at start of function:
```typescript
const shopIdArray = Array.isArray(shopIds) ? shopIds : [shopIds];
const timezones = await getShopTimezones(shopIdArray);
const timezone = timezones.get(shopIdArray[0]);
```

### 2. Replace `sale_period` CTE with inline date filter:
```typescript
const dateFilterCondition = timezone
  ? `
      [timestamp_column] >= TIMESTAMP('${startDate} 00:00:00', '${timezone}')
      AND [timestamp_column] <= TIMESTAMP('${endDate} 23:59:59', '${timezone}')
    `
  : `
      [timestamp_column] >= TIMESTAMP('${startDate} 00:00:00')
      AND [timestamp_column] <= TIMESTAMP('${endDate} 23:59:59')
    `;
```

### 3. Remove `CROSS JOIN sale_period sp` and replace date comparisons with `${dateFilterCondition}`

### Functions to Update:
- ✅ getCoreMetrics (completed)
- ✅ getPeakGMV (completed)
- ⏳ getTopProducts
- ⏳ getRetailMetrics
- ⏳ getCustomerInsights
- ⏳ getReferrerData
- ⏳ getChannelPerformance
- ⏳ getShopBreakdown
- ⏳ getDiscountMetrics
- ⏳ getInternationalSales
- ⏳ getUnitsPerTransaction
- ⏳ getConversionMetrics

