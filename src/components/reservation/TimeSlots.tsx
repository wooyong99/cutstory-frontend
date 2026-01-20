import type { TimeSlot } from '../../types';
import { SlotSkeleton } from '../common';
import { EmptyState } from '../common';
import './TimeSlots.css';

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading: boolean;
  durationInfo?: string; // 소요 시간 안내 (예: "2시간 소요")
}

export function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  isLoading,
  durationInfo,
}: TimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-header">
          <h3 className="time-slots-title">시간 선택</h3>
        </div>
        <SlotSkeleton />
      </div>
    );
  }

  // 시작 가능한 슬롯이 있는지 확인
  const startableSlots = slots.filter((slot) => slot.isStartable);

  if (startableSlots.length === 0 && slots.length > 0) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-header">
          <h3 className="time-slots-title">시간 선택</h3>
          {durationInfo && <p className="time-slots-duration">{durationInfo}</p>}
        </div>
        <EmptyState
          icon="📅"
          title="이 날짜에는 예약 가능한 시간이 없습니다"
          description="다른 날짜를 선택해보세요."
        />
      </div>
    );
  }

  return (
    <div className="time-slots-container">
      <div className="time-slots-header">
        <h3 className="time-slots-title">시간 선택</h3>
        {durationInfo && <p className="time-slots-duration">{durationInfo}</p>}
      </div>
      <p className="time-slots-hint">시작 시간을 선택하세요</p>
      <div className="time-slots-grid">
        {slots.map((slot) => {
          const isReserved = slot.status === 'reserved';
          const isUnavailable = !slot.isStartable && !isReserved;
          const isDisabled = isReserved || isUnavailable;
          const isSelected = selectedTime === slot.time;

          let statusText = '';
          let ariaLabel = `${slot.time}`;

          if (isReserved) {
            statusText = '예약됨';
            ariaLabel += ' 예약됨';
          } else if (isUnavailable) {
            statusText = '시간 부족';
            ariaLabel += ' 연속 시간 부족';
          } else {
            ariaLabel += ' 예약 가능';
          }

          return (
            <button
              key={slot.time}
              type="button"
              className={`time-slot ${isSelected ? 'selected' : ''} ${isReserved ? 'reserved' : ''} ${isUnavailable ? 'unavailable' : ''}`}
              onClick={() => !isDisabled && onSelectTime(slot.time)}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              aria-pressed={isSelected}
              aria-label={ariaLabel}
              title={isUnavailable ? '선택한 시술의 연속 시간이 부족합니다' : undefined}
            >
              <span className="time-slot-time">{slot.time}</span>
              {statusText && <span className="time-slot-status">{statusText}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
