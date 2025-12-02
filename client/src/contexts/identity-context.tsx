import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  fullName: string;
  given_name: string;
  family_name: string;
}

interface IdentityContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    async function loadIdentity() {
      try {
        if (!window.quick || !window.quick.id) {
          setTimeout(loadIdentity, 100);
          return;
        }

        console.log('🔐 Waiting for user authentication via Quick...');
        const userData = await window.quick.id.waitForUser();
        console.log('✅ User authenticated:', userData);
        
        const nameParts = (userData.name || '').split(' ');
        const givenName = nameParts[0] || '';
        const familyName = nameParts.slice(1).join(' ') || '';
        
        setUser({
          email: userData.email,
          fullName: userData.name,
          given_name: givenName,
          family_name: familyName,
        });
      } catch (err) {
        console.warn('Identity error:', err);
        setUser({
          email: 'user@shopify.com',
          fullName: 'User',
          given_name: 'User',
          family_name: '',
        });
      } finally {
        setLoading(false);
      }
    }

    loadIdentity();
  }, []);

  return (
    <IdentityContext.Provider value={{ user, loading, error }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const context = useContext(IdentityContext);
  if (context === undefined) {
    throw new Error('useIdentity must be used within an IdentityProvider');
  }
  return context;
}

