import { apiClient } from './apiClient';
import type { ExerciseList, ExerciseDetail, PaginatedResponse } from '../contracts';

export const exercisesService = {
  getExercises: async (search?: string, difficulty?: number, skill_id?: number, page: number = 1) => {
    const params: Record<string, any> = { page };
    if (search) params.search = search;
    if (difficulty) params.difficulty = difficulty;
    if (skill_id) params.skills__id = skill_id;
    const response = await apiClient.get<PaginatedResponse<ExerciseList>>('/exercises/', { params });
    return response.data;
  },

  getExercise: async (stableId: string) => {
    const response = await apiClient.get<ExerciseDetail>(`/exercises/${stableId}/`);
    return response.data;
  }
};
