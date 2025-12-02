/**
 * Quick API wrapper for BigQuery queries
 * Handles authentication and query execution
 */

declare global {
  interface Window {
    quick: {
      id: {
        waitForUser(): Promise<{
          email: string;
          name: string;
          slackProfile?: string;
          title?: string;
          githubHandle?: string;
        }>;
      };
      auth: {
        requestScopes(scopes: string[]): Promise<{ hasRequiredScopes: boolean }>;
      };
      dw: {
        querySync(query: string, params?: any[], options?: {
          timeoutMs?: number;
          maxResults?: number;
        }): Promise<any>;
      };
    };
  }
}

/**
 * Check if we're in the Quick environment
 */
export function isQuickEnvironment(): boolean {
  return typeof window !== 'undefined' && 
         window.quick !== undefined && 
         window.quick.id !== undefined &&
         window.quick.dw !== undefined;
}

/**
 * Wait for Quick to be available
 */
export async function waitForQuick(timeout: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (!isQuickEnvironment()) {
    if (Date.now() - startTime > timeout) {
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return true;
}

interface BigQueryRow {
  [key: string]: any;
}

interface BigQueryResult {
  rows: BigQueryRow[];
}

export const quickAPI = {
  /**
   * Query BigQuery using Quick's built-in data warehouse service
   */
  async queryBigQuery(query: string): Promise<BigQueryResult> {
    try {
      if (!isQuickEnvironment()) {
        throw new Error('Quick environment not available');
      }

      console.log('📊 Executing BigQuery query...');
      console.log('📝 Query:', query.substring(0, 100) + '...');

      const result = await window.quick.dw.querySync(query, [], {
        timeoutMs: 120000,
        maxResults: 10000
      });
      
      console.log('✅ Query executed successfully');

      if (!result) {
        console.warn('⚠️ Query returned null/undefined, returning empty result');
        return { rows: [] };
      }

      if (Array.isArray(result)) {
        return { rows: result };
      }

      if (typeof result === 'object' && 'error' in result) {
        const errorMessage = (result as any).error?.message || JSON.stringify(result);
        console.error('❌ BigQuery returned error:', errorMessage);
        throw new Error(`BigQuery error: ${errorMessage}`);
      }

      if (typeof result === 'object' && 'results' in result) {
        return { rows: (result as any).results || [] };
      }

      if (typeof result === 'object' && 'rows' in result) {
        return result as BigQueryResult;
      }

      return { rows: [result] };
    } catch (error) {
      console.error('BigQuery query failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`BigQuery query failed: ${String(error)}`);
    }
  },
};

