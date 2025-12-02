import React, { createContext, useContext, useEffect, useState } from 'react';
import { isQuickEnvironment } from '@/lib/quick-api';

interface BigQueryAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsManualAuth: boolean;
  requestAuth: () => Promise<boolean>;
}

const BigQueryAuthContext = createContext<BigQueryAuthContextType | undefined>(undefined);

let authPromise: Promise<boolean> | null = null;

async function requestBigQueryAuth(): Promise<boolean> {
  if (authPromise) {
    console.log('🔄 Auth request already in progress, waiting...');
    return authPromise;
  }

  authPromise = (async () => {
    try {
      if (!isQuickEnvironment()) {
        console.log('📍 Not in Quick environment - skipping auth');
        return true;
      }

      console.log('🔐 Requesting BigQuery OAuth scopes...');
      const authResult = await window.quick.auth.requestScopes([
        'https://www.googleapis.com/auth/bigquery',
        'https://www.googleapis.com/auth/cloud-platform'
      ]);

      console.log('🔍 Auth result:', authResult);

      if (!authResult || !authResult.hasRequiredScopes) {
        throw new Error('BigQuery permissions not granted');
      }

      console.log('✅ BigQuery authentication successful!');
      return true;
    } catch (error) {
      console.error('❌ BigQuery auth failed:', error);
      throw error;
    } finally {
      setTimeout(() => {
        authPromise = null;
      }, 1000);
    }
  })();

  return authPromise;
}

export function BigQueryAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsManualAuth, setNeedsManualAuth] = useState(false);

  useEffect(() => {
    if (isQuickEnvironment()) {
      setNeedsManualAuth(true);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const triggerAuth = async () => {
    if (isAuthenticated) return true;
    
    setIsLoading(true);
    setError(null);

    try {
      const success = await requestBigQueryAuth();
      setIsAuthenticated(success);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BigQueryAuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      error,
      needsManualAuth,
      requestAuth: triggerAuth,
    }}>
      {children}
    </BigQueryAuthContext.Provider>
  );
}

export function useBigQueryAuth() {
  const context = useContext(BigQueryAuthContext);
  if (context === undefined) {
    throw new Error('useBigQueryAuth must be used within a BigQueryAuthProvider');
  }
  return context;
}

