import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMenuItemById, fetchDateSlots, createReservation } from '../services/api';
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
import { CATEGORY_LABELS, type MenuOption, type SelectedMenu, type MenuCategory } from '../types';
import './StyleDetailPage.css';

const CATEGORY_ICONS: Record<MenuCategory, string> = {
  cut: '✂️',
  color: '🎨',
  perm: '💫',
};

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

  // 시간 슬롯 조회 (날짜 선택 시)
  const {
    data: slotsResponse,
    isLoading: isSlotsLoading,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: ['dateSlots', selectedDate],
    queryFn: () => fetchDateSlots(selectedDate!),
    enabled: !!selectedDate,
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
        queryKey: ['dateSlots', selectedDate],
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

  // 날짜 변경 시 시간 초기화
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  // 옵션 변경 시 선택된 시간 초기화
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

  // 임시 이미지 URL (실제로는 menuItem.imageUrl 사용)
  const imageUrl = menuItem.imageUrl || `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop`;

  // 예약 진행 상태 계산
  const bookingProgress = {
    hasDate: !!selectedDate,
    hasTime: !!selectedTime,
    isComplete: !!selectedDate && !!selectedTime,
  };

  return (
    <div className="detail-page">
      {/* 뒤로가기 */}
      <Link to="/" className="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>

      {/* 히어로 이미지 */}
      <div className="detail-hero">
        <img src={imageUrl} alt={menuItem.name} className="detail-hero-image" />
        <div className="detail-hero-overlay" />
        <span className="detail-category-badge">
          {CATEGORY_ICONS[menuItem.category]} {CATEGORY_LABELS[menuItem.category]}
        </span>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="detail-content">
        {/* 메뉴 정보 카드 */}
        <div className="detail-info-card">
          <div className="info-card-header">
            <div className="info-card-title-group">
              <h1 className="info-card-title">{menuItem.name}</h1>
              {menuItem.description && (
                <p className="info-card-description">{menuItem.description}</p>
              )}
            </div>
            <div className="info-card-price-group">
              <span className="info-card-price">
                {formatPrice(menuItem.basePrice)}
                {menuItem.priceNote && <span className="price-suffix">{menuItem.priceNote}</span>}
              </span>
            </div>
          </div>

          <div className="info-card-meta">
            <div className="meta-item">
              <span className="meta-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4.5V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="meta-label">소요시간</span>
              <span className="meta-value">{formatDuration(menuItem.durationMinutes)}</span>
            </div>
          </div>

          {/* 옵션 선택 */}
          {menuItem.options && menuItem.options.length > 0 && (
            <div className="options-section">
              <div className="section-header">
                <span className="section-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 1.5V16.5M1.5 9H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
                <h3 className="section-title">추가 옵션</h3>
              </div>
              <div className="options-grid">
                {menuItem.options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={selectedOptionIds.includes(option.id)}
                    onToggle={() => handleOptionToggle(option.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 선택 요약 */}
          {selectedOptionIds.length > 0 && selectedMenu && (
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">기본 시술</span>
                <span className="summary-value">{formatPrice(menuItem.basePrice)}</span>
              </div>
              {menuItem.options?.filter(opt => selectedOptionIds.includes(opt.id)).map(opt => (
                <div key={opt.id} className="summary-row">
                  <span className="summary-label">+ {opt.name}</span>
                  <span className="summary-value">{formatPrice(opt.price)}</span>
                </div>
              ))}
              <div className="summary-row summary-total">
                <span className="summary-label">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 4.5V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  총 {formatDuration(selectedMenu.totalDurationMinutes)}
                </span>
                <span className="summary-value">{formatPrice(selectedMenu.totalPrice)}</span>
              </div>
            </div>
          )}
        </div>

        {/* 예약 섹션 */}
        <div className="booking-card">
          <div className="section-header">
            <span className="section-icon booking-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 1V4M12 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <h3 className="section-title">예약하기</h3>
          </div>

          {/* 예약 진행 상태 */}
          <div className="booking-progress">
            <div className={`progress-step ${bookingProgress.hasDate ? 'completed' : 'active'}`}>
              <span className="step-number">1</span>
              <span className="step-label">날짜 선택</span>
            </div>
            <div className="progress-line" />
            <div className={`progress-step ${bookingProgress.hasTime ? 'completed' : bookingProgress.hasDate ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">시간 선택</span>
            </div>
            <div className="progress-line" />
            <div className={`progress-step ${bookingProgress.isComplete ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">예약 완료</span>
            </div>
          </div>

          {/* 날짜 선택 */}
          <div className="booking-step-section">
            <div className="step-header">
              <span className="step-badge">STEP 1</span>
              <span className="step-title">날짜를 선택해주세요</span>
            </div>
            <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          {/* 시간 선택 */}
          {selectedDate && (
            <div className="booking-step-section">
              <div className="step-header">
                <span className="step-badge">STEP 2</span>
                <span className="step-title">시간을 선택해주세요</span>
              </div>
              <TimeSlots
                slots={slotsResponse?.slots || []}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                isLoading={isSlotsLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* 예약 확인 바 */}
      {selectedDate && selectedTime && selectedMenu && endTime && (
        <div className="booking-bar">
          <div className="booking-bar-content">
            <div className="booking-bar-info">
              <span className="booking-bar-date">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M4.5 0.5V3M9.5 0.5V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {formatDateKorean(selectedDate)}
              </span>
              <span className="booking-bar-time">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {formatTimeRange(selectedTime, endTime)}
              </span>
            </div>
            <span className="booking-bar-price">{formatPrice(selectedMenu.totalPrice)}</span>
          </div>
          <button
            type="button"
            className="booking-bar-button"
            onClick={handleReservation}
            disabled={reservationMutation.isPending}
          >
            {reservationMutation.isPending ? (
              <>
                <span className="button-spinner" />
                예약 중...
              </>
            ) : (
              <>
                예약하기
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* 토스트 메시지 */}
      {reservationMutation.isError && (
        <div className="toast-message toast-error">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 5.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="9" cy="12.5" r="0.75" fill="currentColor"/>
          </svg>
          <p>다른 고객이 먼저 예약했어요. 다른 시간을 선택해주세요.</p>
        </div>
      )}

      {showSuccessToast && (
        <div className="toast-message toast-success">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6 9L8 11L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
      <div className="option-card-checkbox">
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className="option-card-content">
        <span className="option-card-name">{option.name}</span>
        {option.description && (
          <span className="option-card-desc">{option.description}</span>
        )}
      </div>
      <div className="option-card-meta">
        <span className="option-card-price">+{formatPrice(option.price)}</span>
        <span className="option-card-duration">+{option.additionalMinutes}분</span>
      </div>
    </button>
  );
}

// 날짜 포맷 (예: "1월 20일 (월)")
function formatDateKorean(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = weekDays[date.getDay()];
  return `${month}월 ${day}일 (${dayOfWeek})`;
}
