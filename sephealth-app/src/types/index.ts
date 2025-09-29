export interface User {
  _id?: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WellnessAssessment {
  _id?: string;
  userId?: string;
  email?: string;
  responses: Record<string, unknown>;
  createdAt?: Date;
}

export interface EmailSignup {
  _id?: string;
  email: string;
  createdAt?: Date;
}

export interface DashboardData {
  user: Omit<User, 'password'>;
  recentAssessments?: WellnessAssessment[];
  totalAssessments?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}