// Career Coach Service
// Calls Supabase Edge Function for career analysis

import { supabase } from '@/lib/supabase';

export interface CareerPath {
  title: string;
  description: string;
  timeframe: string;
  steps: string[];
  requiredSkills: string[];
  potentialRoles: string[];
  salaryRange: string;
}

export interface SkillGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  currentLevel: string;
  targetLevel: string;
  resources: string[];
  learningPath: string[];
  estimatedTime: string;
}

export interface CareerInsights {
  opportunities: string[];
  warnings: string[];
  tips: string[];
}

export interface MarketInsights {
  industryTrends: string[];
  jobGrowth: string;
  salaryExpectations: string;
  demandSkills: string[];
}

export interface CareerCoachResult {
  personalizedPaths: CareerPath[];
  skillGaps: SkillGap[];
  insights: CareerInsights;
  marketInsights: MarketInsights;
}

export interface CareerCoachSession {
  id: string;
  timestamp: number;
  userId: string;
  profileHash: string;
  result: CareerCoachResult;
}

export class CareerCoachService {
  /**
   * Generate profile hash to detect changes
   */
  static generateProfileHash(onboardingData: any): string {
    const relevantFields = {
      target_roles: onboardingData.target_roles,
      cv_skills: onboardingData.cv_skills,
      experience_level: onboardingData.experience_level,
      cv_work_experience: onboardingData.cv_work_experience,
      cv_education: onboardingData.cv_education,
      sector: onboardingData.sector,
    };
    // Use encodeURIComponent to handle non-Latin1 characters safely
    const jsonString = JSON.stringify(relevantFields);
    const encoded = encodeURIComponent(jsonString);
    // Create a simple hash-like string (first 32 chars of encoded string)
    return encoded.substring(0, 32).replace(/%/g, '');
  }

  /**
   * Check if cached analysis is still valid
   */
  static getCachedAnalysis(userId: string, profileHash: string): CareerCoachResult | null {
    try {
      const cached = localStorage.getItem(`career_coach_${userId}`);
      if (cached) {
        const session: CareerCoachSession = JSON.parse(cached);
        if (session.profileHash === profileHash) {
          // Check if cache is less than 7 days old
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          if (session.timestamp > sevenDaysAgo) {
            return session.result;
          }
        }
      }
    } catch (error) {
      console.error('Error reading cached analysis:', error);
    }
    return null;
  }

  /**
   * Get current user's cached analysis (for career page)
   */
  static getAnalysis(): CareerCoachResult | null {
    try {
      // Try to get from localStorage using a generic approach
      // This is a simplified version - the career page will handle auth/onboarding checks
      const keys = Object.keys(localStorage).filter(key => key.startsWith('career_coach_'));
      if (keys.length === 0) return null;

      // Get the most recent one
      let latestSession: CareerCoachSession | null = null;
      let latestTimestamp = 0;

      for (const key of keys) {
        try {
          const session: CareerCoachSession = JSON.parse(localStorage.getItem(key)!);
          if (session.timestamp > latestTimestamp) {
            latestSession = session;
            latestTimestamp = session.timestamp;
          }
        } catch (e) {
          // Skip invalid entries
        }
      }

      // Check if cache is still valid (7 days)
      if (latestSession && (Date.now() - latestSession.timestamp) < 7 * 24 * 60 * 60 * 1000) {
        return latestSession.result;
      }

      return null;
    } catch (error) {
      console.error('Error getting analysis:', error);
      return null;
    }
  }

  /**
   * Save analysis to cache
   */
  static saveToCache(userId: string, profileHash: string, result: CareerCoachResult): void {
    try {
      const session: CareerCoachSession = {
        id: `career_coach_${userId}_${Date.now()}`,
        timestamp: Date.now(),
        userId,
        profileHash,
        result,
      };
      localStorage.setItem(`career_coach_${userId}`, JSON.stringify(session));
      
      // Also add to history
      const history = this.getHistory();
      history.unshift(session);
      // Keep only last 10 sessions
      const limitedHistory = history.slice(0, 10);
      localStorage.setItem('career_coach_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Get analysis history
   */
  static getHistory(): CareerCoachSession[] {
    try {
      const history = localStorage.getItem('career_coach_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  /**
   * Generate Career Coach Analysis by calling Supabase Edge Function
   */
  static async generateAnalysis(userId: string, onboardingData: any): Promise<CareerCoachResult> {
    // Check cache first
    const profileHash = this.generateProfileHash(onboardingData);
    const cached = this.getCachedAnalysis(userId, profileHash);
    if (cached) {
      console.log('Using cached career coach analysis');
      return cached;
    }

    try {
      const { data, error } = await supabase.functions.invoke('career-coach', {
        body: {
          userId,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to generate career analysis: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from career coach service');
      }

      if (!data.success) {
        throw new Error(data?.error || 'Failed to generate career analysis');
      }

      const result = data.data as CareerCoachResult;
      
      // Save to cache
      this.saveToCache(userId, profileHash, result);
      
      return result;
    } catch (error: any) {
      console.error('Error generating career analysis:', error);
      throw new Error(error.message || 'Failed to generate career analysis. Please try again.');
    }
  }
}

