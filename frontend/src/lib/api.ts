import { useAuthStore } from '@/store';
import { env } from '@/lib/env';
import type {
  User,
  CheckinResult,
  Ingredient,
  CheckinSummary,
} from '@/store/types';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = env.apiUrl;

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Only set Content-Type to application/json if not passing FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((e: any) => `${e.loc?.join('.') || 'Field'}: ${e.msg}`).join(', ');
      } else {
        errorMessage = errorData.detail || errorData.message || errorMessage;
      }
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (e.g., 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth Endpoints
export const loginUser = async (data: Record<string, string>): Promise<{ user: User; token: string }> => {
  return fetcher('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const registerUser = async (data: Record<string, string>): Promise<{ user: User; token: string }> => {
  return fetcher('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Check-in Endpoints
export const submitQuestionnaire = async (data: Record<string, number>): Promise<{ p_dry: number; p_balanced: number; p_oily: number }> => {
  return fetcher('/api/v1/checkin/questionnaire', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const uploadCheckin = async (formData: FormData): Promise<CheckinResult> => {
  return fetcher('/api/v1/checkin/upload', {
    method: 'POST',
    body: formData,
  });
};

export const getCheckins = async (page: number = 1): Promise<{ checkins: CheckinSummary[]; hasNextPage: boolean }> => {
  return fetcher(`/api/v1/checkins?page=${page}`, {
    method: 'GET',
  });
};

export const getCheckinDetail = async (id: string): Promise<CheckinResult> => {
  return fetcher(`/api/v1/checkins/${id}`, {
    method: 'GET',
  });
};

export const updateSkinType = async (skinType: string): Promise<User> => {
  return fetcher('/api/v1/auth/me/skin-type', {
    method: 'PATCH',
    body: JSON.stringify({ skinType }),
  });
};

export interface SkinTypeHistoryEntry {
  id: string;
  timestamp: string;
  previousValue: string | null;
  newValue: string;
  source: 'Model prediction' | 'You adjusted this';
  confidence: number | null;
}

export const getSkinTypeHistory = async (): Promise<SkinTypeHistoryEntry[]> => {
  return fetcher('/api/v1/auth/me/skin-type-history', {
    method: 'GET',
  });
};

// Ingredient Endpoints
export const getIngredients = async (): Promise<Ingredient[]> => {
  return fetcher('/api/v1/ingredients', {
    method: 'GET',
  });
};

export const addIngredient = async (ingredient: Omit<Ingredient, 'id' | 'created_at' | 'discontinued_at'>): Promise<Ingredient> => {
  return fetcher('/api/v1/ingredients', {
    method: 'POST',
    body: JSON.stringify(ingredient),
  });
};

export const updateIngredient = async (id: string, updates: Partial<Ingredient>): Promise<Ingredient> => {
  return fetcher(`/api/v1/ingredients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

export const discontinueIngredient = async (id: string): Promise<Ingredient> => {
  return fetcher(`/api/v1/ingredients/${id}/discontinue`, {
    method: 'POST',
  });
};

export const deleteIngredient = async (id: string): Promise<void> => {
  return fetcher(`/api/v1/ingredients/${id}`, {
    method: 'DELETE',
  });
};

// User Data Endpoints
export const exportUserData = async (): Promise<Blob> => {
  const token = useAuthStore.getState().token;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/v1/users/export`, {
    headers,
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to export data');
  }
  
  return response.blob();
};

export const deleteAccount = async (): Promise<void> => {
  return fetcher('/api/v1/users/me', {
    method: 'DELETE',
  });
};
