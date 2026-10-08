import { apiClient } from './apiClient';

export interface RecommendedExercise {
  id: number;
  stable_id: string;
  title: string;
  difficulty: number;
  status: string;
  skills: any[];
}

export const skillsService = {
  getRecommendedExercises: async () => {
    const response = await apiClient.get<RecommendedExercise[]>('/skills/recommended/');
    return response.data;
  },
};
