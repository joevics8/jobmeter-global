"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface CreditDetails {
  permanent: number;
  daily: number;
  total: number;
}

export function useCredits() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [permanentCredits, setPermanentCredits] = useState<number>(0);
  const [dailyCredits, setDailyCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
    };
    loadUser();
  }, []);

  const loadCreditBalance = useCallback(async () => {
    if (!user?.id) {
      setBalance(0);
      setPermanentCredits(0);
      setDailyCredits(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('balance, daily_credits_available')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No credit record found
          setBalance(0);
          setPermanentCredits(0);
          setDailyCredits(0);
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      const permanent = data?.balance || 0;
      const daily = data?.daily_credits_available || 0;
      const total = permanent + daily;

      setPermanentCredits(permanent);
      setDailyCredits(daily);
      setBalance(total);
    } catch (err: any) {
      console.error('Error loading credit balance:', err);
      setError(err.message || 'Failed to load credits');
      setBalance(0);
      setPermanentCredits(0);
      setDailyCredits(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCreditBalance();
  }, [loadCreditBalance]);

  const hasEnoughCredits = useCallback((requiredAmount: number = 1): boolean => {
    return balance >= requiredAmount;
  }, [balance]);

  return {
    balance,
    permanentCredits,
    dailyCredits,
    loading,
    error,
    hasEnoughCredits,
    loadCreditBalance,
    refresh: loadCreditBalance,
  };
}

