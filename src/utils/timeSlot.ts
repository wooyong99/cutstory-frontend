import {
  SLOT_DURATION_MINUTES,
  OPENING_HOUR,
  CLOSING_HOUR,
  type MenuItem,
  type MenuOption,
  type SelectedMenu,
} from '../types';

/**
 * 소요 시간(분)을 30분 슬롯 개수로 변환 (올림 처리)
 */
export function calculateRequiredSlots(durationMinutes: number): number {
  return Math.ceil(durationMinutes / SLOT_DURATION_MINUTES);
}

/**
 * 메뉴 + 옵션 선택 정보로 총 가격, 시간, 슬롯 수 계산
 */
export function calculateSelectedMenu(
  menuItem: MenuItem,
  selectedOptions: MenuOption[] = []
): SelectedMenu {
  const totalPrice =
    menuItem.basePrice + selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalDurationMinutes =
    menuItem.durationMinutes +
    selectedOptions.reduce((sum, opt) => sum + opt.additionalMinutes, 0);
  const requiredSlots = calculateRequiredSlots(totalDurationMinutes);

  return {
    menuItem,
    selectedOptions,
    totalPrice,
    totalDurationMinutes,
    requiredSlots,
  };
}

/**
 * 모든 30분 슬롯 시간 문자열 생성 (10:00 ~ 19:30)
 */
export function generateAllSlotTimes(): string[] {
  const slots: string[] = [];
  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

/**
 * 시간 문자열을 슬롯 인덱스로 변환
 */
export function timeToSlotIndex(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours - OPENING_HOUR) * 2 + (minutes === 30 ? 1 : 0);
}

/**
 * 슬롯 인덱스를 시간 문자열로 변환
 */
export function slotIndexToTime(index: number): string {
  const totalMinutes = OPENING_HOUR * 60 + index * SLOT_DURATION_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 시작 시간과 소요 시간으로 종료 시간 계산
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

/**
 * 시간 범위 포맷 (예: "10:00 ~ 12:00")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} ~ ${endTime}`;
}

/**
 * 소요 시간 포맷 (예: "2시간", "1시간 30분", "30분")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}분`;
  }
  if (mins === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${mins}분`;
}

/**
 * 가격 포맷 (예: "10,000원")
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`;
}
