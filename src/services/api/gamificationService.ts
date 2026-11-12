import { apiClient } from './apiClient';

export interface GamificationProfile {
  id: number;
  username: string;
  full_name?: string;
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

export interface ChallengeExercise {
  id: number;
  stable_id: string;
  title: string;
  difficulty: number;
  description?: string;
  is_solved?: boolean;
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  username: string;
  full_name: string;
  score: number;
  joined_at: string;
}

export interface Challenge {
  id: number;
  stable_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'UPCOMING' | 'FINISHED';
  is_joined: boolean;
  user_score: number;
  participants_count: number;
  exercises: ChallengeExercise[];
  leaderboard: ChallengeLeaderboardEntry[];
}

export interface ChallengeParticipation {
  id: number;
  challenge: any;
  user: number;
  score: number;
  joined_at: string;
  is_joined?: boolean;
  already_joined?: boolean;
  message?: string;
}

export const gamificationService = {
  getProfile: async () => {
    const response = await apiClient.get<GamificationProfile>('/gamification/profile/');
    return response.data;
  },

  getRanking: async () => {
    const response = await apiClient.get<any>('/gamification/ranking/');
    return response.data.results || response.data;
  },

  getAchievements: async () => {
    const response = await apiClient.get<any>('/gamification/achievements/');
    return response.data.results || response.data;
  },

  getActiveChallenges: async () => {
    const response = await apiClient.get<any>('/gamification/challenges/');
    return response.data.results || response.data;
  },

  getChallengeDetail: async (stable_id: string) => {
    const response = await apiClient.get<Challenge>(`/gamification/challenges/${stable_id}/`);
    return response.data;
  },

  joinChallenge: async (challenge_id: string) => {
    const response = await apiClient.post<ChallengeParticipation>('/gamification/challenges/join/', { challenge_id });
    return response.data;
  }
};
