import type { User, SignupFormData, SignUpRequest, LoginResponse, ApiResponse, ApiError, UserListItem, CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest, CreateMenuRequest, MenuListResponse, MenuDetailResponse, TimeSlotResponse, ReservationResponse, CreateReservationRequest, AdminReservationResponse, TermsResponse } from '../types';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ADMIN_API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL;

export class ApiException extends Error {
  errorCode: string;
  errorMessage: string;

  constructor(errorCode: string, errorMessage: string) {
    super(errorMessage);
    this.name = 'ApiException';
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
  }
}

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const body: ApiResponse<T> = await response.json();

  if (!body.isSuccess || body.error) {
    const error = body.error as ApiError;
    throw new ApiException(
      error?.errorCode ?? 'UNKNOWN_ERROR',
      error?.errorMessage ?? '알 수 없는 오류가 발생했습니다.',
    );
  }

  return body.data as T;
}

async function adminApiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const body: ApiResponse<T> = await response.json();

  if (!body.isSuccess || body.error) {
    const error = body.error as ApiError;
    throw new ApiException(
      error?.errorCode ?? 'UNKNOWN_ERROR',
      error?.errorMessage ?? '알 수 없는 오류가 발생했습니다.',
    );
  }

  return body.data as T;
}

// ── 카테고리 API (사용자) ──

export async function fetchCategories(): Promise<CategoryResponse[]> {
  return apiClient<CategoryResponse[]>('/api/v1/categories');
}

export async function fetchMenusByCategory(categoryId: number): Promise<MenuListResponse[]> {
  return apiClient<MenuListResponse[]>(`/api/v1/categories/${categoryId}/menus`);
}

// ── 메뉴 상세 API ──

export async function fetchMenuDetail(id: number): Promise<MenuDetailResponse> {
  return apiClient<MenuDetailResponse>(`/api/v1/menus/${id}`);
}

// ── 예약 API ──

export async function fetchAvailableSlots(date: string, menuId: number, optionIds: number[]): Promise<TimeSlotResponse[]> {
  const params = new URLSearchParams();
  params.append('date', date);
  params.append('menuId', String(menuId));
  for (const id of optionIds) {
    params.append('optionIds', String(id));
  }
  return apiClient<TimeSlotResponse[]>(`/api/v1/reservations/available-slots?${params.toString()}`);
}

export async function fetchMyReservations(): Promise<ReservationResponse[]> {
  return apiClient<ReservationResponse[]>('/api/v1/reservations/me');
}

export async function createReservation(data: CreateReservationRequest): Promise<ReservationResponse> {
  return apiClient<ReservationResponse>('/api/v1/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function cancelMyReservation(id: number): Promise<void> {
  return apiClient<void>(`/api/v1/reservations/${id}`, {
    method: 'DELETE',
  });
}

// ── 관리자 예약 API ──

export async function fetchAdminReservations(date: string): Promise<AdminReservationResponse[]> {
  return adminApiClient<AdminReservationResponse[]>(`/api/v1/admin/reservations?date=${date}`);
}

export async function adminCancelReservation(id: number): Promise<void> {
  return adminApiClient<void>(`/api/v1/admin/reservations/${id}/cancel`, {
    method: 'PATCH',
  });
}

export async function adminCompleteReservation(id: number): Promise<void> {
  return adminApiClient<void>(`/api/v1/admin/reservations/${id}/complete`, {
    method: 'PATCH',
  });
}

// ── 약관 API ──

export async function fetchTerms(): Promise<TermsResponse[]> {
  return apiClient<TermsResponse[]>('/api/v1/terms');
}

// ── 인증 API ──

export async function signup(data: SignupFormData): Promise<User> {
  const request: SignUpRequest = {
    username: data.name,
    age: parseInt(data.age, 10),
    email: data.email,
    phone: data.phone.replace(/-/g, ''),
    password: data.password,
    agreedTermsIds: data.agreedTermsIds,
  };

  return apiClient<User>('/api/v1/auth/sign-up', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(): Promise<User> {
  return apiClient<User>('/api/v1/users/me');
}

// ── 관리자 API ──

export async function adminSignup(data: { email: string; password: string; username: string }): Promise<User> {
  return adminApiClient<User>('/api/v1/admin/auth/sign-up', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  return adminApiClient<LoginResponse>('/api/v1/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchUsers(): Promise<UserListItem[]> {
  return adminApiClient<UserListItem[]>('/api/v1/admin/users');
}

export async function createCategory(data: CreateCategoryRequest): Promise<CategoryResponse> {
  return adminApiClient<CategoryResponse>('/api/v1/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(`/api/v1/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return adminApiClient<void>(`/api/v1/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function createMenu(data: CreateMenuRequest): Promise<void> {
  return adminApiClient<void>('/api/v1/admin/menus', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenu(menuId: number, data: CreateMenuRequest): Promise<void> {
  return adminApiClient<void>(`/api/v1/admin/menus/${menuId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenu(menuId: number): Promise<void> {
  return adminApiClient<void>(`/api/v1/admin/menus/${menuId}`, {
    method: 'DELETE',
  });
}

