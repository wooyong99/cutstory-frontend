// 사용자 역할
export type UserRole = 'USER' | 'ADMIN';

// 사용자 관련 타입 (GET /api/v1/users/me 응답)
export interface User {
  id: number;
  email: string;
  username: string;
  age: number;
  phone: string;
  role: UserRole;
}

// 관리자 회원 목록 조회 응답
export interface UserListItem {
  id: number;
  email: string;
  username: string;
  age: number;
  phone: string;
  role: UserRole;
  registeredAt: string;
}

// 카테고리 응답
export interface CategoryResponse {
  id: number;
  name: string;
}

export interface SignupFormData {
  name: string;
  age: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  age: number;
  email: string;
  phone: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// 메뉴 카테고리
export type MenuCategory = 'cut' | 'color' | 'perm';

export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  cut: '컷',
  color: '염색',
  perm: '펌',
};

// 메뉴 옵션 타입
export interface MenuOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  additionalMinutes: number; // 추가 소요 시간
}

// 메뉴(시술) 타입
export interface MenuItem {
  id: string;
  category: MenuCategory;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number; // 기본 가격
  priceNote?: string; // 가격 참고사항 (예: "길이/상태에 따라 상이")
  durationMinutes: number; // 기본 소요 시간 (분)
  options?: MenuOption[]; // 선택 가능한 옵션
}

// 선택된 메뉴 + 옵션 (예약용)
export interface SelectedMenu {
  menuItem: MenuItem;
  selectedOptions: MenuOption[];
  totalPrice: number;
  totalDurationMinutes: number;
  requiredSlots: number; // 필요한 30분 슬롯 수
}

// 예약 관련 타입
export interface TimeSlot {
  time: string; // "10:00", "10:30" 등 (30분 단위)
  available: boolean;
}

// API에서 날짜별 슬롯 응답
export interface DateSlotsResponse {
  date: string; // "2026-01-20"
  slots: TimeSlot[];
}

export interface Reservation {
  id: string;
  userId: string;
  menuId: string;
  optionIds?: string[];
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (시작 시간)
  endTime: string; // HH:mm (종료 시간)
  durationMinutes: number;
  createdAt: string;
}

// API 공통 응답 타입
export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  errorCode: string;
  errorMessage: string;
}

// 카테고리 생성 요청
export interface CreateCategoryRequest {
  name: string;
}

// 메뉴 옵션 생성 요청
export interface CreateMenuOptionRequest {
  name: string;
  duration: number;
  price: number;
  description: string;
}

// 메뉴 생성 요청
export interface CreateMenuRequest {
  name: string;
  description: string;
  minDuration: number;
  maxDuration: number;
  price: number;
  mainImage: string;
  detailImages: string[];
  options: CreateMenuOptionRequest[];
  categoryIds: number[];
}

// 시간 슬롯 상수
export const SLOT_DURATION_MINUTES = 30;
export const OPENING_HOUR = 10;
export const CLOSING_HOUR = 20; // 마지막 시작 가능 시간은 이전
