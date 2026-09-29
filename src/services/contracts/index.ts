import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export interface CustomTokenObtainPair {
  access: string;
  refresh: string;
}

export const RegisterSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Debe ser un correo válido"),
  full_name: z.string().min(1, "El nombre completo es obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type Register = z.infer<typeof RegisterSchema>;

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'STUDENT' | 'ADMIN_TEACHER';
  date_joined: string;
}

export interface NodeData {
  id: string;
  name: string;
  mastery: number; // 0 to 1
  isInitialized: boolean;
}

export interface EdgeData {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: NodeData[];
  links: EdgeData[];
}

export interface SkillBasic {
  id: number;
  stable_id: string;
  name: string;
  description?: string;
}

export interface ExerciseList {
  id: number;
  stable_id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  skills: SkillBasic[];
}

export interface TestCase {
  id?: number;
  inputs: string;
  expected_outputs: string;
  case_type: 'VISIBLE' | 'HIDDEN';
}

export interface ExerciseDetail extends ExerciseList {
  statement: string;
  time_limit_ms: number;
  memory_limit_kb: number;
  test_cases: TestCase[];
}

export interface SubmissionCreate {
  exercise_id: string; // Wait, schema says exercise_id, which is likely stable_id since it's type string. Let's use it as string.
  source_code: string;
  language: string;
}

export interface Submission {
  id: number;
  author_username: string;
  exercise_stable_id: string;
  source_code: string;
  language: string;
  state: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  verdict: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'SYSTEM_ERROR';
  time_used_ms: number | null;
  memory_used_kb: number | null;
  error_details: string | null;
  created_at: string;
  updated_at: string;
}
