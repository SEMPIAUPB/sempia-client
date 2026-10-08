import { apiClient } from './apiClient';

export interface DashboardMetrics {
  learning_metrics: {
    problems_solved: number;
    success_rate: number;
    current_streak: number;
    training_hours: number;
  };
  gamification: {
    points: number;
    level: number;
    next_level_points: number;
    progress_percentage: number;
  };
  top_skills: {
    name: string;
    percentage: number;
  }[];
}

export const dashboardService = {
  getMetrics: async () => {
    const response = await apiClient.get<DashboardMetrics>('/accounts/dashboard/');
    return response.data;
  },
};
