import { useState } from 'react';
import type { TimeSlot } from '../../types';
import { SlotSkeleton, EmptyState } from '../common';
import './TimeSlots.css';

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  isLoading,
  isError,
  onRetry,
}: TimeSlotsProps) {
  const [showAll, setShowAll] = useState(true);

  if (isLoading) {
    return (
      <div className="time-slots-container">
        <SlotSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="time-slots-container">
        <EmptyState
          icon="⚠️"
          title="시간 정보를 불러오지 못했습니다"
          description="잠시 후 다시 시도해주세요."
          actionLabel="다시 시도"
          onAction={onRetry}
        />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="time-slots-container">
        <EmptyState
          icon="📅"
          title="시간 정보가 없습니다"
          description="해당 날짜의 시간 정보를 불러올 수 없습니다."
          actionLabel="다시 시도"
          onAction={onRetry}
        />
      </div>
    );
  }

  const availableSlots = slots.filter((slot) => !slot.disabled);

  if (availableSlots.length === 0) {
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

  const displaySlots = showAll ? slots : availableSlots;

  // 오전/오후로 분류
  const morningSlots = displaySlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour < 12;
  });
  const afternoonSlots = displaySlots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour >= 12;
  });

  return (
    <div className="time-slots-container">
      <div className="time-slots-toggle">
        <button
          type="button"
          className={`toggle-button ${showAll ? 'active' : ''}`}
          onClick={() => setShowAll(true)}
        >
          전체보기
        </button>
        <button
          type="button"
          className={`toggle-button ${!showAll ? 'active' : ''}`}
          onClick={() => setShowAll(false)}
        >
          예약 가능한 시간보기
        </button>
      </div>

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
  const isDisabled = slot.disabled;

  return (
    <button
      type="button"
      className={`time-slot ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={() => !isDisabled && onSelect(slot.time)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={`${slot.time} ${slot.disabled ? '예약 불가' : '예약 가능'}`}
    >
      {slot.time}
    </button>
  );
}
