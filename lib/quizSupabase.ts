// 📁 lib/quizSupabase.ts
import { createClient } from '@supabase/supabase-js';

// Dedicated Supabase instance for the Quiz feature
// This is separate from the main app's Supabase client
const QUIZ_SUPABASE_URL = process.env.NEXT_PUBLIC_QUIZ_SUPABASE_URL!;
const QUIZ_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_QUIZ_SUPABASE_ANON_KEY!;

export const quizSupabase = createClient(QUIZ_SUPABASE_URL, QUIZ_SUPABASE_ANON_KEY);