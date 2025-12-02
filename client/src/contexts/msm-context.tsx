import React, { createContext, useContext, useState } from 'react';
import { useIdentity } from './identity-context';

interface MSM {
  name: string;
  email: string;
  fullName: string;
}

interface MSMContextType {
  msm: MSM;
  setMSM: (msm: MSM) => void;
  isOverride: boolean;
  resetToDefault: () => void;
}

const MSMContext = createContext<MSMContextType | undefined>(undefined);

export function MSMProvider({ children }: { children: React.ReactNode }) {
  const { user } = useIdentity();
  const [overrideMSM, setOverrideMSM] = useState<MSM | null>(null);

  const defaultMSM: MSM = {
    name: user?.fullName || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
  };

  const currentMSM = overrideMSM || defaultMSM;

  return (
    <MSMContext.Provider
      value={{
        msm: currentMSM,
        setMSM: setOverrideMSM,
        isOverride: overrideMSM !== null,
        resetToDefault: () => setOverrideMSM(null),
      }}
    >
      {children}
    </MSMContext.Provider>
  );
}

export function useMSM() {
  const context = useContext(MSMContext);
  if (context === undefined) {
    throw new Error('useMSM must be used within an MSMProvider');
  }
  return context;
}

/**
 * Hook to get the effective MSM name for queries
 */
export function useEffectiveMSM() {
  const { msm, isOverride } = useMSM();
  const { user } = useIdentity();

  return {
    msm,
    isOverride,
    effectiveMSMName: isOverride ? msm.name : (user?.fullName || ''),
    effectiveMSMEmail: isOverride ? msm.email : (user?.email || ''),
  };
}

