import { apiClient } from './apiClient';
import type { SubmissionCreate, Submission, PaginatedResponse } from '../contracts';

export const submissionsService = {
  submitCode: async (data: SubmissionCreate) => {
    const response = await apiClient.post<Submission>('/submissions/', data);
    return response.data;
  },

  getSubmission: async (id: number) => {
    const response = await apiClient.get<Submission>(`/submissions/${id}/`);
    return response.data;
  },

  getSubmissions: async (page: number = 1) => {
    const response = await apiClient.get<PaginatedResponse<Submission>>(`/submissions/?page=${page}`);
    return response.data;
  }
};
