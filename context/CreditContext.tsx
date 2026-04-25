"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface CreditContextType {
  credits: number | null;
  isPro: boolean;
  loading: boolean;
  refreshCredits: () => Promise<void>;
  deductCredit: (amount?: number) => Promise<{ success: boolean; error?: string }>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshCredits = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setCredits(null);
        setIsPro(false);
        return;
      }

      // Fetch credits and profile in a single request
      // We use !inner to tell Supabase this is a required relationship
      const { data, error } = await supabase
        .from('user_credits')
        .select(`
          credits_remaining,
          profiles!user_credits_user_id_fkey (
            plan_type
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Credit Fetch Error:', error.message);
        // Fallback: If the join fails, try to at least get the credits
        const { data: simpleData } = await supabase
          .from('user_credits')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (simpleData) setCredits(simpleData.credits_remaining);
      } else if (data) {
        setCredits(data.credits_remaining);
        // @ts-ignore
        const planType = data.profiles?.plan_type;
        setIsPro(planType === 'pro' || planType === 'premium');
      }
    } catch (err) {
      console.error('Unexpected error in refreshCredits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCredits();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshCredits();
    });
    return () => subscription.unsubscribe();
  }, [refreshCredits]);

  const deductCredit = async (amount = 1) => {
    if (isPro) return { success: true };

    if (credits === null || credits < amount) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Optimistic Update
    const previousCredits = credits;
    setCredits(prev => (prev !== null ? prev - amount : null));

    const { error } = await supabase.rpc('deduct_user_credits', { 
      amount_to_deduct: amount 
    });

    if (error) {
      console.error('Deduction failed:', error);
      setCredits(previousCredits); // Rollback
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  return (
    <CreditContext.Provider value={{ credits, isPro, loading, refreshCredits, deductCredit }}>
      {children}
    </CreditContext.Provider>
  );
}

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (!context) throw new Error('useCredits must be used within a CreditProvider');
  return context;
};