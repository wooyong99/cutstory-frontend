import type { TimeSlot } from '../../types';
import { SlotSkeleton, EmptyState } from '../common';
import './TimeSlots.css';

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading: boolean;
}

export function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  isLoading,
}: TimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="time-slots-container">
        <SlotSkeleton />
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  if (availableSlots.length === 0 && slots.length > 0) {
    return (
      <div className="time-slots-container">
        <EmptyState
          icon="📅"
          title="예약 가능한 시간이 없습니다"
          description="다른 날짜를 선택해보세요."
        />
      </div>
    );
  }

  // 오전/오후로 분류
  const morningSlots = slots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour < 12;
  });
  const afternoonSlots = slots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour >= 12;
  });

  return (
    <div className="time-slots-container">
      {morningSlots.length > 0 && (
        <div className="time-slots-section">
          <span className="time-slots-period">오전</span>
          <div className="time-slots-grid">
            {morningSlots.map((slot) => (
              <TimeSlotButton
                key={slot.time}
                slot={slot}
                isSelected={selectedTime === slot.time}
                onSelect={onSelectTime}
              />
            ))}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div className="time-slots-section">
          <span className="time-slots-period">오후</span>
          <div className="time-slots-grid">
            {afternoonSlots.map((slot) => (
              <TimeSlotButton
                key={slot.time}
                slot={slot}
                isSelected={selectedTime === slot.time}
                onSelect={onSelectTime}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TimeSlotButtonProps {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (time: string) => void;
}

function TimeSlotButton({ slot, isSelected, onSelect }: TimeSlotButtonProps) {
  const isDisabled = !slot.available;

  return (
    <button
      type="button"
      className={`time-slot ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={() => !isDisabled && onSelect(slot.time)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={`${slot.time} ${slot.available ? '예약 가능' : '예약 불가'}`}
    >
      {slot.time}
    </button>
  );
}
