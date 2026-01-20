import type { MenuItem, TimeSlot, User, SignupFormData, Reservation, MenuCategory } from '../types';
import { calculateAvailableSlots, calculateEndTime, generateAllSlotTimes } from '../utils/timeSlot';

// API_BASE_URL은 실제 API 연동 시 사용
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Mock 메뉴 데이터 (RESERVATION_TIME_POLICY.md 기반)
const mockMenuItems: MenuItem[] = [
  // 컷
  {
    id: 'cut-male',
    category: 'cut',
    name: '남자 컷',
    description: '샴푸 별도',
    basePrice: 10000,
    durationMinutes: 30,
    options: [
      {
        id: 'opt-shampoo',
        name: '샴푸',
        description: '컷트 시 샴푸',
        price: 3000,
        additionalMinutes: 10,
      },
    ],
  },
  {
    id: 'cut-female',
    category: 'cut',
    name: '여자 컷',
    description: '샴푸 별도',
    basePrice: 15000,
    durationMinutes: 60,
    options: [
      {
        id: 'opt-shampoo',
        name: '샴푸',
        description: '컷트 시 샴푸',
        price: 3000,
        additionalMinutes: 10,
      },
    ],
  },
  // 염색
  {
    id: 'color-root',
    category: 'color',
    name: '뿌리 염색',
    description: '새치/부분 염색',
    basePrice: 30000,
    durationMinutes: 90,
    options: [
      {
        id: 'opt-cut-color',
        name: '컷트 추가',
        description: '염색 시 컷트',
        price: 10000,
        additionalMinutes: 30,
      },
    ],
  },
  {
    id: 'color-full',
    category: 'color',
    name: '전체 염색',
    description: '길이/상태에 따라 상이',
    basePrice: 50000,
    priceNote: '~',
    durationMinutes: 120,
    options: [
      {
        id: 'opt-cut-color',
        name: '컷트 추가',
        description: '염색 시 컷트',
        price: 10000,
        additionalMinutes: 30,
      },
    ],
  },
  // 펌
  {
    id: 'perm-down',
    category: 'perm',
    name: '다운펌',
    description: '볼륨/결 정리',
    basePrice: 20000,
    durationMinutes: 60,
  },
  {
    id: 'perm-normal',
    category: 'perm',
    name: '일반 펌',
    description: '기본 펌',
    basePrice: 50000,
    priceNote: '~',
    durationMinutes: 120,
  },
  {
    id: 'perm-magic',
    category: 'perm',
    name: '매직',
    description: '스트레이트',
    basePrice: 60000,
    priceNote: '~',
    durationMinutes: 150,
  },
  {
    id: 'perm-volume-magic',
    category: 'perm',
    name: '볼륨 매직',
    description: '볼륨 + 매직',
    basePrice: 70000,
    priceNote: '~',
    durationMinutes: 180,
  },
];

// Mock 예약된 시간 (30분 단위)
const mockReservedSlots: Record<string, string[]> = {
  '2026-01-20': ['10:00', '10:30', '14:00', '14:30', '15:00', '16:00'],
  '2026-01-21': ['11:00', '11:30', '15:00', '15:30', '16:00', '16:30'],
  '2026-01-22': ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
};

// API 함수들
export async function fetchMenuItems(): Promise<MenuItem[]> {
  await delay(500);
  return mockMenuItems;
}

export async function fetchMenuItemsByCategory(category: MenuCategory): Promise<MenuItem[]> {
  await delay(300);
  return mockMenuItems.filter((item) => item.category === category);
}

export async function fetchMenuItemById(id: string): Promise<MenuItem | null> {
  await delay(300);
  return mockMenuItems.find((item) => item.id === id) || null;
}

/**
 * 시간 슬롯 조회 (연속 슬롯 가능 여부 포함)
 * @param requiredSlots 필요한 슬롯 수 (30분 단위)
 * @param date 날짜
 */
export async function fetchTimeSlots(
  requiredSlots: number,
  date: string
): Promise<TimeSlot[]> {
  await delay(400);

  const reservedTimes = mockReservedSlots[date] || [];
  return calculateAvailableSlots(reservedTimes, requiredSlots);
}

/**
 * 예약된 시간 목록만 조회 (raw data)
 */
export async function fetchReservedTimes(date: string): Promise<string[]> {
  await delay(200);
  return mockReservedSlots[date] || [];
}

export async function signup(data: SignupFormData): Promise<User> {
  await delay(800);

  const user: User = {
    id: Math.random().toString(36).substring(7),
    name: data.name,
    age: parseInt(data.age, 10),
    email: data.email,
    phone: data.phone,
  };

  return user;
}

export async function login(email: string, password: string): Promise<User> {
  await delay(600);

  if (email && password) {
    return {
      id: '1',
      name: '테스트 사용자',
      age: 25,
      email,
      phone: '010-1234-5678',
    };
  }

  throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
}

export interface CreateReservationParams {
  menuId: string;
  optionIds?: string[];
  date: string;
  startTime: string;
  durationMinutes: number;
}

export async function createReservation(params: CreateReservationParams): Promise<Reservation> {
  await delay(600);

  const { menuId, optionIds, date, startTime, durationMinutes } = params;

  // Mock: 동시성 체크 시뮬레이션 (10% 확률로 실패)
  if (Math.random() < 0.1) {
    throw new Error('방금 다른 사용자가 예약했어요. 다른 시간을 선택해주세요.');
  }

  const endTime = calculateEndTime(startTime, durationMinutes);

  const reservation: Reservation = {
    id: Math.random().toString(36).substring(7),
    userId: '1',
    menuId,
    optionIds,
    date,
    startTime,
    endTime,
    durationMinutes,
    createdAt: new Date().toISOString(),
  };

  // Mock: 예약된 시간 슬롯 추가
  if (!mockReservedSlots[date]) {
    mockReservedSlots[date] = [];
  }

  // 예약된 모든 30분 슬롯 추가
  const allTimes = generateAllSlotTimes();
  const startIndex = allTimes.indexOf(startTime);
  const slotsToReserve = Math.ceil(durationMinutes / 30);

  for (let i = 0; i < slotsToReserve; i++) {
    const time = allTimes[startIndex + i];
    if (time && !mockReservedSlots[date].includes(time)) {
      mockReservedSlots[date].push(time);
    }
  }

  return reservation;
}

// 유틸리티
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
