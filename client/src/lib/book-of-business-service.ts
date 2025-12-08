import { quickAPI } from './quick-api';

export interface MerchantAccount {
  account_id: string;
  account_name: string;
  primary_shop_id: string;
  gmv_usd_l365d: number;
  shop_count: number;
}

/**
 * Fetch all merchant accounts for a given CSM/MSM
 * 
 * Queries the Shopify Data Warehouse to retrieve all accounts managed by the specified
 * Merchant Success Manager, including their primary shop IDs and GMV data.
 * 
 * @param msmName - The full name of the Merchant Success Manager (must match account_owner field)
 * @returns Array of merchant accounts with shop IDs and GMV data
 * @throws Error if the BigQuery query fails
 * 
 * @example
 * ```typescript
 * const accounts = await fetchBookOfBusiness('John Doe');
 * console.log(`Found ${accounts.length} accounts`);
 * ```
 */
export async function fetchBookOfBusiness(msmName: string): Promise<MerchantAccount[]> {
  if (!msmName || msmName.trim().length === 0) {
    console.warn('⚠️ No MSM name provided to fetchBookOfBusiness');
    return [];
  }

  const query = `
    SELECT 
      ual.account_id,
      ual.account_name,
      COALESCE(rags.gmv_usd_l365d, 0) as gmv_usd_l365d,
      ARRAY_LENGTH(ual.shop_ids) as shop_count
    FROM \`sdp-prd-commercial.mart.unified_account_list\` ual
    LEFT JOIN \`shopify-dw.mart_revenue_data.revenue_account_gmv_summary\` rags
      ON ual.account_id = rags.account_id
    WHERE UPPER(TRIM(ual.account_owner)) = UPPER(TRIM('${msmName}'))
      AND ual.account_type = 'Customer'
    ORDER BY rags.gmv_usd_l365d DESC NULLS LAST, ual.account_name
    LIMIT 1000
  `;

  try {
    console.log('📊 Fetching Book of Business for:', msmName);
    const result = await quickAPI.queryBigQuery(query);
    const rows = result.rows;

    console.log('✅ Found', rows?.length || 0, 'accounts for', msmName);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row: any) => {
      return {
        account_id: String(row.account_id || ''),
        account_name: String(row.account_name || 'Unknown Account'),
        primary_shop_id: '', // UAL doesn't have primary_shop_id field
        gmv_usd_l365d: Number(row.gmv_usd_l365d || 0),
        shop_count: Number(row.shop_count || 0),
      };
    });
  } catch (error) {
    console.error('❌ Error fetching Book of Business:', error);
    throw new Error('Failed to fetch Book of Business');
  }
}

/**
 * Format GMV (Gross Merchandise Value) for human-readable display
 * 
 * Converts numeric GMV values to abbreviated format:
 * - >= $1B: Shows as billions (e.g., "$1.23B")
 * - >= $1M: Shows as millions (e.g., "$2.5M")
 * - >= $1K: Shows as thousands (e.g., "$500K")
 * - < $1K: Shows as dollars (e.g., "$500")
 * 
 * @param gmv - The GMV value in USD
 * @returns Formatted string representation of the GMV
 * 
 * @example
 * ```typescript
 * formatGMV(1500000) // "$1.5M"
 * formatGMV(5000000000) // "$5.0B"
 * formatGMV(750) // "$750"
 * ```
 */
export interface ShopInfo {
  shop_id: string;
  shop_name: string | null;
  gmv_usd_l365d: number;
  is_primary: boolean;
}

/**
 * Fetch all shops for a given account
 * 
 * Queries the Shopify Data Warehouse to retrieve all shops associated with an account,
 * including their GMV data and primary shop designation.
 * 
 * @param accountId - The Salesforce Account ID
 * @returns Array of shops with shop IDs, names, and GMV data
 * @throws Error if the BigQuery query fails
 * 
 * @example
 * ```typescript
 * const shops = await fetchAccountShops('0018V00002czG21QAE');
 * console.log(`Found ${shops.length} shops`);
 * ```
 */
export async function fetchAccountShops(accountId: string): Promise<ShopInfo[]> {
  if (!accountId || accountId.trim().length === 0) {
    console.warn('⚠️ No account ID provided to fetchAccountShops');
    return [];
  }

  const query = `
    WITH account_shops AS (
      SELECT 
        ual.account_id,
        shop_id
      FROM \`sdp-prd-commercial.mart.unified_account_list\` ual
      CROSS JOIN UNNEST(ual.shop_ids) as shop_id
      WHERE ual.account_id = '${accountId}'
        AND shop_id IS NOT NULL
    ),
    shops_with_gmv AS (
      SELECT 
        ac.shop_id,
        ac.account_id,
        COALESCE(gmv.gmv_usd_l365d, 0) as gmv_usd_l365d,
        spc.name as shop_name
      FROM account_shops ac
      LEFT JOIN \`shopify-dw.finance.shop_gmv_current\` gmv
        ON ac.shop_id = gmv.shop_id
      LEFT JOIN \`shopify-dw.accounts_and_administration.shop_profile_current\` spc
        ON ac.shop_id = spc.shop_id
      WHERE COALESCE(gmv.gmv_usd_l365d, 0) > 0  -- Filter out $0 GMV shops
    )
    SELECT DISTINCT
      CAST(shop_id AS STRING) as shop_id,
      shop_name,
      gmv_usd_l365d,
      FALSE as is_primary  -- UAL doesn't have primary_shop_id concept
    FROM shops_with_gmv
    ORDER BY gmv_usd_l365d DESC
    LIMIT 100
  `;

  try {
    console.log('📊 Fetching shops for account:', accountId);
    const result = await quickAPI.queryBigQuery(query);
    const rows = result.rows;

    console.log('✅ Found', rows?.length || 0, 'shops for account', accountId);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row: any) => ({
      shop_id: String(row.shop_id || ''),
      shop_name: row.shop_name ? String(row.shop_name) : null,
      gmv_usd_l365d: Number(row.gmv_usd_l365d || 0),
      is_primary: Boolean(row.is_primary),
    }));
  } catch (error) {
    console.error('❌ Error fetching account shops:', error);
    throw new Error('Failed to fetch account shops');
  }
}

export function formatGMV(gmv: number): string {
  if (gmv >= 1_000_000_000) {
    return `$${(gmv / 1_000_000_000).toFixed(2)}B`;
  }
  if (gmv >= 1_000_000) {
    return `$${(gmv / 1_000_000).toFixed(1)}M`;
  }
  if (gmv >= 1_000) {
    return `$${(gmv / 1_000).toFixed(0)}K`;
  }
  return `$${gmv.toFixed(0)}`;
}

