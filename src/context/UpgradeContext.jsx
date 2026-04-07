import React, { createContext, useContext, useState } from 'react';
import posthog from '../lib/posthog';
import UpgradeModal from '../components/ui/UpgradeModal';

/**
 * UpgradeContext — global state for the upgrade modal.
 *
 * Usage:
 *   const { triggerUpgrade } = useUpgrade();
 *   triggerUpgrade('analyzer');   // opens modal with analyzer-specific copy
 *   triggerUpgrade('workouts');   // opens modal with workouts-specific copy
 *   triggerUpgrade();             // opens modal with default copy
 */

const UpgradeContext = createContext(null);

export function UpgradeProvider({ children }) {
  const [open, setOpen]       = useState(false);
  const [feature, setFeature] = useState(null);
  const [tier, setTier]       = useState('pro'); // 'pro' or 'pro_plus'

  const triggerUpgrade = (feat = null, targetTier = 'pro') => {
    setFeature(feat);
    setTier(targetTier);
    setOpen(true);
    posthog.capture('upgrade_modal_viewed', { feature: feat, tier: targetTier });
  };

  return (
    <UpgradeContext.Provider value={{ showUpgradeModal: open, triggerUpgrade }}>
      {children}
      {/* Modal lives at the root so it always renders on top */}
      <UpgradeModal
        isOpen={open}
        feature={feature}
        tier={tier}
        onClose={() => setOpen(false)}
      />
    </UpgradeContext.Provider>
  );
}

export function useUpgrade() {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used within <UpgradeProvider>');
  return ctx;
}
