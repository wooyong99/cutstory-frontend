import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenuItemById, fetchTimeSlots, createReservation } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useReservationStore } from '../stores/reservationStore';
import { Loading, ErrorMessage } from '../components/common';
import { Calendar, TimeSlots } from '../components/reservation';
import {
  calculateSelectedMenu,
  calculateEndTime,
  formatDuration,
  formatPrice,
  formatTimeRange,
} from '../utils/timeSlot';
import type { MenuOption, SelectedMenu } from '../types';
import './StyleDetailPage.css';

export function StyleDetailPage() {
  const { styleId: menuId } = useParams<{ styleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { selectedDate, selectedTime, setSelectedDate, setSelectedTime, resetSelection } =
    useReservationStore();

  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // 메뉴 정보 조회
  const {
    data: menuItem,
    isLoading: isMenuLoading,
    isError: isMenuError,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ['menuItem', menuId],
    queryFn: () => fetchMenuItemById(menuId!),
    enabled: !!menuId,
  });

  // 선택된 메뉴 + 옵션 계산
  const selectedMenu: SelectedMenu | null = useMemo(() => {
    if (!menuItem) return null;
    const selectedOptions = (menuItem.options || []).filter((opt) =>
      selectedOptionIds.includes(opt.id)
    );
    return calculateSelectedMenu(menuItem, selectedOptions);
  }, [menuItem, selectedOptionIds]);

  // 시간 슬롯 조회 (연속 슬롯 필요 수 기반)
  const {
    data: slots,
    isLoading: isSlotsLoading,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ['timeSlots', selectedMenu?.requiredSlots, selectedDate],
    queryFn: () => fetchTimeSlots(selectedMenu!.requiredSlots, selectedDate!),
    enabled: !!selectedMenu && !!selectedDate,
  });

  // 예약 생성
  const reservationMutation = useMutation({
    mutationFn: () =>
      createReservation({
        menuId: menuId!,
        optionIds: selectedOptionIds.length > 0 ? selectedOptionIds : undefined,
        date: selectedDate!,
        startTime: selectedTime!,
        durationMinutes: selectedMenu!.totalDurationMinutes,
      }),
    onSuccess: () => {
      setShowSuccessToast(true);
      resetSelection();
      setSelectedOptionIds([]);
      queryClient.invalidateQueries({
        queryKey: ['timeSlots', selectedMenu?.requiredSlots, selectedDate],
      });
      setTimeout(() => setShowSuccessToast(false), 3000);
    },
    onError: () => {
      refetchSlots();
    },
  });

  // 컴포넌트 언마운트 시 선택 상태 초기화
  useEffect(() => {
    return () => resetSelection();
  }, []);

  // 옵션 변경 시 선택된 시간 초기화 (슬롯 수가 변경되므로)
  const handleOptionToggle = (optionId: string) => {
    setSelectedOptionIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
    setSelectedTime(null);
  };

  const handleReservation = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/styles/${menuId}` } });
      return;
    }

    if (!selectedDate || !selectedTime || !selectedMenu) return;

    reservationMutation.mutate();
  };

  if (isMenuLoading) {
    return <Loading message="메뉴 정보를 불러오는 중..." />;
  }

  if (isMenuError || !menuItem) {
    return (
      <ErrorMessage
        message="메뉴 정보를 불러오는데 실패했습니다."
        onRetry={() => refetchMenu()}
      />
    );
  }

  const endTime =
    selectedTime && selectedMenu
      ? calculateEndTime(selectedTime, selectedMenu.totalDurationMinutes)
      : null;

  return (
    <div className="style-detail-page">
      <Link to="/" className="back-link">
        ← 목록으로
      </Link>

      <header className="style-detail-header">
        <h1 className="style-detail-title">{menuItem.name}</h1>
        {menuItem.description && (
          <p className="style-detail-description">{menuItem.description}</p>
        )}
        <div className="style-detail-meta">
          <span className="style-detail-duration">
            기본 소요시간: {formatDuration(menuItem.durationMinutes)}
          </span>
          <span className="style-detail-price">
            {formatPrice(menuItem.basePrice)}
            {menuItem.priceNote && menuItem.priceNote}
          </span>
        </div>
      </header>

      {/* 옵션 선택 */}
      {menuItem.options && menuItem.options.length > 0 && (
        <section className="options-section">
          <h2 className="section-title">추가 옵션</h2>
          <div className="options-list">
            {menuItem.options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={selectedOptionIds.includes(option.id)}
                onToggle={() => handleOptionToggle(option.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 선택 요약 */}
      {selectedMenu && (
        <div className="selection-summary">
          <div className="summary-item">
            <span className="summary-label">총 소요시간</span>
            <span className="summary-value">{formatDuration(selectedMenu.totalDurationMinutes)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">총 금액</span>
            <span className="summary-value highlight">{formatPrice(selectedMenu.totalPrice)}</span>
          </div>
        </div>
      )}

      <div className="reservation-section">
        <div className="reservation-calendar">
          <h2 className="section-title">날짜 선택</h2>
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        {selectedDate && selectedMenu && (
          <div className="reservation-slots">
            <TimeSlots
              slots={slots || []}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              isLoading={isSlotsLoading}
              durationInfo={`${formatDuration(selectedMenu.totalDurationMinutes)} 소요`}
            />
          </div>
        )}
      </div>

      {/* 예약 확인 바 */}
      {selectedDate && selectedTime && selectedMenu && endTime && (
        <div className="reservation-summary">
          <div className="summary-content">
            <p className="summary-date">{selectedDate}</p>
            <p className="summary-time-range">
              예약 시간: <strong>{formatTimeRange(selectedTime, endTime)}</strong>
            </p>
            <p className="summary-price">{formatPrice(selectedMenu.totalPrice)}</p>
          </div>
          <button
            type="button"
            className="reservation-button"
            onClick={handleReservation}
            disabled={reservationMutation.isPending}
          >
            {reservationMutation.isPending ? (
              <>
                <span className="button-spinner" />
                예약 중...
              </>
            ) : (
              '예약하기'
            )}
          </button>
        </div>
      )}

      {reservationMutation.isError && (
        <div className="error-toast">
          <p>방금 다른 사용자가 예약했어요. 다른 시간을 선택해주세요.</p>
        </div>
      )}

      {showSuccessToast && (
        <div className="success-toast">
          <p>예약이 완료되었습니다!</p>
        </div>
      )}
    </div>
  );
}

// 옵션 카드 컴포넌트
interface OptionCardProps {
  option: MenuOption;
  isSelected: boolean;
  onToggle: () => void;
}

function OptionCard({ option, isSelected, onToggle }: OptionCardProps) {
  return (
    <button
      type="button"
      className={`option-card ${isSelected ? 'selected' : ''}`}
      onClick={onToggle}
      aria-pressed={isSelected}
    >
      <div className="option-checkbox">
        {isSelected && <span className="checkmark">✓</span>}
      </div>
      <div className="option-content">
        <span className="option-name">{option.name}</span>
        {option.description && <span className="option-description">{option.description}</span>}
      </div>
      <div className="option-meta">
        <span className="option-price">+{formatPrice(option.price)}</span>
        <span className="option-duration">+{option.additionalMinutes}분</span>
      </div>
    </button>
  );
}
