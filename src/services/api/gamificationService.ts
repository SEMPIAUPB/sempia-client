import { apiClient } from './apiClient';

export interface GamificationProfile {
  id: number;
  username: string;
  points: number;
  level: number;
  current_streak: number;
  highest_streak: number;
}

export interface CatalogAchievement {
  id: number;
  stable_id: string;
  title: string;
  description: string;
  image_url: string;
  is_unlocked: boolean;
  awarded_at: string | null;
  reason: string | null;
}

export interface Challenge {
  id: number;
  stable_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  exercises: any[];
}

export interface ChallengeParticipation {
  id: number;
  challenge: number;
  user: number;
  score: number;
  joined_at: string;
}

export const gamificationService = {
  getProfile: async () => {
    const response = await apiClient.get<GamificationProfile>('/gamification/profile/');
    return response.data;
  },

  getRanking: async () => {
    // Uses the generic List endpoint (so it's paginated or just a list)
    const response = await apiClient.get<any>('/gamification/ranking/');
    return response.data.results || response.data; // Handle both paginated and non-paginated
  },

  getAchievements: async () => {
    const response = await apiClient.get<any>('/gamification/achievements/');
    return response.data.results || response.data;
  },

  getActiveChallenges: async () => {
    const response = await apiClient.get<any>('/gamification/challenges/');
    return response.data.results || response.data;
  },

  joinChallenge: async (challenge_id: string) => {
    const response = await apiClient.post<ChallengeParticipation>('/gamification/challenges/join/', { challenge_id });
    return response.data;
  }
};
