import { apiClient } from './apiClient';
import type { ExerciseList, ExerciseDetail } from '../contracts';

export const exercisesService = {
  getExercises: async (search?: string) => {
    const params = search ? { search } : {};
    const response = await apiClient.get<ExerciseList[]>('/exercises/', { params });
    return response.data;
  },

  getExercise: async (stableId: string) => {
    const response = await apiClient.get<ExerciseDetail>(`/exercises/${stableId}/`);
    return response.data;
  }
};
