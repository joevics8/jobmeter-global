import { createClient } from '@supabase/supabase-js';

export interface CreditDetails {
  permanent: number;
  daily: number;
  total: number;
}

export class CreditService {
  /**
   * Check if user has enough credits
   */
  static async hasEnoughCredits(
    userId: string,
    requiredAmount: number,
    supabaseServiceKey: string
  ): Promise<boolean> {
    const details = await this.getCreditDetails(userId, supabaseServiceKey);
    return details.total >= requiredAmount;
  }

  /**
   * Get user's credit details (permanent and daily credits)
   */
  static async getCreditDetails(
    userId: string,
    supabaseServiceKey: string
  ): Promise<CreditDetails> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('user_credits')
      .select('balance, daily_credits_available')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No credit record found
        return { permanent: 0, daily: 0, total: 0 };
      }
      throw error;
    }

    const permanent = data?.balance || 0;
    const daily = data?.daily_credits_available || 0;
    const total = permanent + daily;

    return { permanent, daily, total };
  }

  /**
   * Deduct credits from user's account (uses daily credits first, then permanent)
   */
  static async deductCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    supabaseServiceKey?: string
  ): Promise<string> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get current credit info
    const { data: creditData, error: creditError } = await supabase
      .from('user_credits')
      .select('balance, daily_credits_available')
      .eq('user_id', userId)
      .single();

    if (creditError) {
      if (creditError.code === 'PGRST116') {
        throw new Error('Insufficient credits');
      }
      throw creditError;
    }

    const permanentCredits = creditData?.balance || 0;
    const dailyCredits = creditData?.daily_credits_available || 0;
    const totalCredits = permanentCredits + dailyCredits;

    if (totalCredits < amount) {
      throw new Error('Insufficient credits');
    }

    // Priority deduction: daily credits first, then permanent
    const dailyToDeduct = Math.min(dailyCredits, amount);
    const permanentToDeduct = Math.max(0, amount - dailyCredits);

    // Record the transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'usage',
        amount: -amount,
        description,
        reference_id: referenceId,
      })
      .select('id')
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // Update credits
    const updateData: any = {
      balance: permanentCredits - permanentToDeduct,
    };

    if (dailyToDeduct > 0) {
      updateData.daily_credits_available = dailyCredits - dailyToDeduct;
      updateData.daily_credits_last_used = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('user_credits')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    return transactionData.id;
  }

  /**
   * Add credits to user's account
   */
  static async addCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string,
    supabaseServiceKey?: string
  ): Promise<string> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = supabaseServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Record the transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'purchase',
        amount,
        description,
        reference_id: referenceId,
      })
      .select('id')
      .single();

    if (transactionError) {
      throw transactionError;
    }

    // Update or create user credits
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (existingCredits) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          balance: (existingCredits.balance || 0) + amount,
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          balance: amount,
          daily_credits_available: 0,
        });

      if (insertError) {
        throw insertError;
      }
    }

    return transactionData.id;
  }
}


