# BFCM Wrapped - Advanced Performance Queries

## Overview

This document provides production-ready BigQuery queries for four critical BFCM performance dimensions:
1. **Channel Performance** - Online, POS, B2B, Shop breakdown
2. **Shop Pay Performance** - Adoption, GMV contribution, AOV comparison
3. **Shop Pay Installments Performance** - BNPL usage and conversion
4. **Checkout Performance** - Conversion funnel (Cart → Checkout → Purchase)

All queries tested against **Peppermayo** (Shop ID: 49878007976) with BFCM 2025 data.

---

## 1. Channel Performance Query

*(Same as before - no changes)*

[Previous Channel Performance content remains unchanged]

---

## 2. Shop Pay Performance Query

*(Same as before - no changes)*

[Previous Shop Pay Performance content remains unchanged]

---

## 3. Shop Pay Installments Performance Query

*(Same as before - no changes)*

[Previous Shop Pay Installments content remains unchanged]

---

## 4. Checkout Performance Query ✅ UPDATED

### Purpose
Measure checkout conversion funnel performance: sessions → cart adds → checkout started → checkout completed.

### Visualization
Funnel visualization showing drop-off at each stage, with conversion rates

### Peppermayo Test Results (BFCM 2025):
- **Total Sessions:** 369,396
- **Sessions with Cart Adds:** 33,750 (9.14% add-to-cart rate)
- **Sessions Reached Checkout:** 16,492 (48.87% cart-to-checkout rate)
- **Sessions Completed Checkout:** 9,293 (56.35% checkout completion rate)
- **Overall Conversion Rate:** 2.52%

### Query

```sql
WITH shop_timezones AS (
  SELECT 
    shop_id,
    iana_timezone
  FROM `shopify-dw.accounts_and_administration.shop_profile_current`
  WHERE shop_id IN (${shopIdList})
),

checkout_funnel AS (
  SELECT 
    -- Total sessions
    COUNT(DISTINCT sss.session_id) as total_sessions,
    
    -- Sessions with cart adds
    COUNT(DISTINCT CASE 
      WHEN sss.product_added_to_cart_count > 0 
      THEN sss.session_id 
    END) as sessions_with_cart_adds,
    
    -- Sessions that reached checkout
    COUNT(DISTINCT CASE 
      WHEN sss.has_checkout_started 
      THEN sss.session_id 
    END) as sessions_reached_checkout,
    
    -- Sessions that completed checkout
    COUNT(DISTINCT CASE 
      WHEN sss.has_checkout_completed 
      THEN sss.session_id 
    END) as sessions_completed_checkout
    
  FROM `shopify-dw.buyer_activity.storefront_sessions_summary_v4` sss
  CROSS JOIN (SELECT MIN(iana_timezone) as tz FROM shop_timezones) st
  WHERE sss.shop_id IN (${shopIdList})
    AND sss.first_event_at >= TIMESTAMP('${startDate} 00:00:00', st.tz)
    AND sss.first_event_at <= TIMESTAMP('${endDate} 23:59:59', st.tz)
)

SELECT 
  total_sessions,
  sessions_with_cart_adds,
  sessions_reached_checkout,
  sessions_completed_checkout,
  
  -- Conversion rates at each stage
  SAFE_DIVIDE(sessions_with_cart_adds, total_sessions) * 100 as add_to_cart_rate,
  SAFE_DIVIDE(sessions_reached_checkout, sessions_with_cart_adds) * 100 as cart_to_checkout_rate,
  SAFE_DIVIDE(sessions_completed_checkout, sessions_reached_checkout) * 100 as checkout_completion_rate,
  SAFE_DIVIDE(sessions_completed_checkout, total_sessions) * 100 as overall_conversion_rate
  
FROM checkout_funnel
```

### Key Fields Used:
- `product_added_to_cart_count` - Number of cart add events in session
- `has_checkout_started` - Boolean flag indicating checkout initiation
- `has_checkout_completed` - Boolean flag indicating successful purchase

### Data Points Returned:
| Field | Description |
|-------|-------------|
| `total_sessions` | All browsing sessions |
| `sessions_with_cart_adds` | Sessions where user added items to cart |
| `sessions_reached_checkout` | Sessions where user initiated checkout |
| `sessions_completed_checkout` | Sessions resulting in purchase |
| `add_to_cart_rate` | % of sessions with cart adds |
| `cart_to_checkout_rate` | % of cart sessions reaching checkout |
| `checkout_completion_rate` | % of checkouts completing purchase |
| `overall_conversion_rate` | % of all sessions completing purchase |

### Data Source:
`shopify-dw.buyer_activity.storefront_sessions_summary_v4`

**Why v4?** Version 4 addresses missing Storefront orders (~5% lift for data >= 2024-10-01) compared to v3.

---

### UI Presentation:

```
┌─────────────────────────────────────────────────────────┐
│   Checkout Funnel Performance - BFCM 2025               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   [Funnel Visualization]                                │
│                                                         │
│   369,396 Total Sessions                                │
│        ↓ 9.14% add to cart                              │
│   33,750 Sessions with Cart Adds                        │
│        ↓ 48.87% proceed to checkout                     │
│   16,492 Sessions Reached Checkout                      │
│        ↓ 56.35% complete purchase                       │
│    9,293 Sessions Completed Checkout                    │
│                                                         │
│   Overall Conversion Rate: 2.52%                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│   Key Insights:                                         │
│   • 90.86% of sessions browse without adding to cart    │
│   • 51.13% of cart adds abandon before checkout         │
│   • 43.65% of checkouts abandon before purchase         │
│   • Largest drop-off: Cart Add → Checkout (51%)        │
└─────────────────────────────────────────────────────────┘
```

### Advanced: Time-Based Funnel Analysis

```sql
-- Add to main query for hourly breakdown
SELECT 
  TIMESTAMP_TRUNC(sss.first_event_at, HOUR) as hour,
  COUNT(DISTINCT sss.session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN sss.product_added_to_cart_count > 0 THEN sss.session_id END) as sessions_with_cart_adds,
  COUNT(DISTINCT CASE WHEN sss.has_checkout_started THEN sss.session_id END) as sessions_reached_checkout,
  COUNT(DISTINCT CASE WHEN sss.has_checkout_completed THEN sss.session_id END) as sessions_completed_checkout,
  SAFE_DIVIDE(
    COUNT(DISTINCT CASE WHEN sss.has_checkout_completed THEN sss.session_id END),
    COUNT(DISTINCT sss.session_id)
  ) * 100 as overall_conversion_rate
FROM `shopify-dw.buyer_activity.storefront_sessions_summary_v4` sss
WHERE sss.shop_id IN (${shopIdList})
  AND sss.first_event_at >= TIMESTAMP('${startDate} 00:00:00')
  AND sss.first_event_at <= TIMESTAMP('${endDate} 23:59:59')
GROUP BY hour
ORDER BY hour
```

### Advanced: Device Breakdown

```sql
-- Add device dimension to funnel
SELECT 
  sss.client_user_agent.device_type,
  COUNT(DISTINCT sss.session_id) as total_sessions,
  SAFE_DIVIDE(
    COUNT(DISTINCT CASE WHEN sss.has_checkout_completed THEN sss.session_id END),
    COUNT(DISTINCT sss.session_id)
  ) * 100 as conversion_rate
FROM `shopify-dw.buyer_activity.storefront_sessions_summary_v4` sss
WHERE sss.shop_id IN (${shopIdList})
  AND sss.first_event_at >= TIMESTAMP('${startDate} 00:00:00')
  AND sss.first_event_at <= TIMESTAMP('${endDate} 23:59:59')
GROUP BY sss.client_user_agent.device_type
ORDER BY total_sessions DESC
```

---

## TypeScript Interface Definitions

```typescript
export interface ChannelPerformance {
  channel_type: 'online' | 'pos' | 'b2b' | 'shop';
  gmv_2025: number;
  orders_2025: number;
  gmv_2024: number;
  orders_2024: number;
  yoy_growth_pct: number;
}

export interface ShopPayPerformance {
  shop_pay_orders: number;
  shop_pay_gmv: number;
  shop_pay_aov: number;
  non_shop_pay_orders: number;
  non_shop_pay_gmv: number;
  non_shop_pay_aov: number;
  total_orders: number;
  total_gmv: number;
  shop_pay_adoption_pct: number;
  shop_pay_gmv_pct: number;
  aov_lift_pct: number;
}

export interface ShopPayInstallmentsPerformance {
  installments_orders: number;
  installments_gmv: number;
  installments_aov: number;
  shop_pay_regular_orders: number;
  shop_pay_regular_gmv: number;
  total_shop_pay_orders: number;
  total_shop_pay_gmv: number;
  total_orders: number;
  total_gmv: number;
  installments_of_shop_pay_pct: number;
  installments_overall_pct: number;
  installments_gmv_pct: number;
}

export interface CheckoutPerformance {
  total_sessions: number;
  sessions_with_cart_adds: number;
  sessions_reached_checkout: number;
  sessions_completed_checkout: number;
  add_to_cart_rate: number; // Percentage
  cart_to_checkout_rate: number; // Percentage
  checkout_completion_rate: number; // Percentage
  overall_conversion_rate: number; // Percentage
}
```

---

## Combined Report Section Structure

### Recommended UI Layout:

```
BFCM 2025 Report - Peppermayo
=====================================

[Hero Metrics: Total GMV, Orders, AOV]

Channel Performance
-------------------
Online:  \$1.13M (100%) | YoY: +923% ✨
POS:     \$0 (0%)
B2B:     \$0 (0%)

Payment Performance
-------------------
Shop Pay Adoption: 44.8% of orders
  • Shop Pay:         3,916 orders | \$491K GMV | \$125.43 AOV
  • Other Payments:   4,822 orders | \$638K GMV | \$132.87 AOV
  • Installments:     0 orders (not enabled)

Checkout Conversion Funnel
---------------------------
Overall Conversion Rate: 2.52%
  
  369,396 Sessions
    ↓ 9.14% add to cart
  33,750 With Cart Adds
    ↓ 48.87% reach checkout
  16,492 Reached Checkout
    ↓ 56.35% complete
  9,293 Completed Purchase

Key Drop-off: 51% abandon cart before checkout

[Additional sections: Top Products, Customer Insights, etc.]
```

---

## Integration Notes

### Query Execution Order:
1. Execute Channel Performance (includes YoY comparison)
2. Execute Shop Pay Performance
3. Execute Shop Pay Installments (dependent on Shop Pay data)
4. Execute Checkout Performance

### Caching Strategy:
- Cache channel performance (rarely changes during report generation)
- Calculate payment metrics in parallel with checkout metrics
- All queries can run simultaneously (no dependencies)

### Error Handling:
```typescript
// Graceful degradation if data unavailable
if (channelPerformance.pos === 0 && channelPerformance.b2b === 0) {
  // Hide multi-channel chart, show online-only badge
}

if (shopPayInstallments.installments_orders === 0) {
  // Show "Installments not enabled" message instead of 0%
}

if (checkoutPerformance.total_sessions === 0) {
  // Show "No session data available" message
}
```

---

## Testing Checklist

- [x] Peppermayo (online-only, high Shop Pay adoption, good conversion data)
- [ ] Harvey Norman (multi-channel with POS)
- [ ] Test merchant with B2B enabled
- [ ] Test merchant with Shop Pay Installments enabled
- [ ] Multi-shop account (aggregate across all shops)
- [ ] Edge case: Shop with 0 Shop Pay adoption
- [ ] Edge case: Shop with very low conversion rate (<1%)
- [ ] Edge case: Shop with missing session data

---

## Query Performance Benchmarks

| Query | Peppermayo (369K sessions) | Expected 1M sessions | Expected 5M sessions |
|-------|---------------------------|----------------------|----------------------|
| Channel Performance | <2s | <5s | <10s |
| Shop Pay Performance | <2s | <4s | <8s |
| Shop Pay Installments | <2s | <4s | <8s |
| Checkout Performance | <2s | <5s | <12s |

All queries use partition filtering on appropriate date fields for optimal performance.

---

## Data Quality Notes

### Checkout Performance Caveats:
- Uses `storefront_sessions_summary_v4` (addresses ~5% missing orders in v3)
- Session data available from 2024-09-18 with quality guarantees
- Data before 2024-09-18 exists but without quality promise
- Consent-filtered: only includes analytics_allowed = TRUE sessions
- Some session loss (~1%) due to:
  - Ad blockers
  - GDPR/CCPA compliance (no consent)
  - Client-side event loss

### Conversion Rate Interpretation:
Peppermayo's 2.52% overall conversion rate is **within normal range** for fashion e-commerce:
- Industry benchmark: 1-3% for fashion
- Add-to-cart rate (9.14%) is healthy
- Cart abandonment (51%) is typical
- Checkout abandonment (44%) suggests optimization opportunity

