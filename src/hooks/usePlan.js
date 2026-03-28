import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Returns the current user's plan and their stripe_customer_id.
 *
 * { plan: 'free' | 'pro', stripeCustomerId: string | null, isLoading: boolean }
 *
 * Reads from the `profiles` table which is updated by the Stripe webhook.
 */
export function usePlan() {
  const [plan, setPlan] = useState('free');
  const [stripeCustomerId, setStripeCustomerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPlan() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        if (mounted) setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier, stripe_customer_id')
        .eq('id', userId)
        .maybeSingle();

      if (mounted) {
        setPlan(data?.subscription_tier === 'pro' ? 'pro' : 'free');
        setStripeCustomerId(data?.stripe_customer_id ?? null);
        setIsLoading(false);
      }
    }

    fetchPlan();

    // Re-fetch if auth state changes (e.g. login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setIsLoading(true);
      fetchPlan();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { plan, stripeCustomerId, isLoading };
}
