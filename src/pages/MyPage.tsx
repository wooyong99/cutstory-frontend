import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { fetchMyReservations, cancelMyReservation } from '../services/api';
import { apiTimeToDisplay, formatPrice } from '../utils/timeSlot';
import { EmptyState, ConfirmModal } from '../components/common';
import type { ReservationResponse, ReservationStatus } from '../types';
import './MyPage.css';

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

const ROLE_LABEL: Record<string, string> = {
  USER: '일반회원',
  ADMIN: '관리자',
};

const REGISTRATION_LABEL: Record<string, string> = {
  GENERAL: '이메일 가입',
  KAKAO: '카카오 가입',
};

const STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: '예약 확정',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
};

type TabKey = 'all' | 'upcoming' | 'past';

function isUpcoming(r: ReservationResponse): boolean {
  const today = new Date().toISOString().split('T')[0];
  return r.status === 'CONFIRMED' && r.reservationDate >= today;
}

function isPast(r: ReservationResponse): boolean {
  const today = new Date().toISOString().split('T')[0];
  return r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.reservationDate < today;
}

export function MyPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);

  const { data: reservations, isLoading: isReservationsLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: fetchMyReservations,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMyReservation,
    onSuccess: () => {
      setCancelTargetId(null);
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancel = (id: number) => {
    setCancelTargetId(id);
  };

  const filteredReservations = (reservations ?? []).filter((r) => {
    if (activeTab === 'upcoming') return isUpcoming(r);
    if (activeTab === 'past') return isPast(r);
    return true;
  });

  return (
    <div className="mypage">
      <title>마이페이지 - 컷스토리 헤어살롱</title>
      <meta name="robots" content="noindex, nofollow" />

      <h1 className="mypage-title">마이페이지</h1>

      {/* 프로필 정보 */}
      <section className="mypage-card" aria-labelledby="profile-heading">
        <div className="mypage-card-header">
          <div className="mypage-card-icon indigo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 id="profile-heading" className="mypage-card-title">프로필 정보</h2>
        </div>

        <div className="profile-top">
          <div className="profile-avatar" aria-hidden="true">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <div className="profile-name-group">
            <span className="profile-name">{user?.username}</span>
            <span className="profile-role-badge">
              {ROLE_LABEL[user?.role ?? ''] ?? user?.role}
            </span>
            <span className={`profile-registration-badge ${user?.registrationType === 'KAKAO' ? 'kakao' : 'general'}`}>
              {REGISTRATION_LABEL[user?.registrationType ?? ''] ?? user?.registrationType}
            </span>
          </div>
        </div>

        <div className="profile-info-list">
          <div className="profile-info-row">
            <span className="profile-info-label">이메일</span>
            <span className="profile-info-value">{user?.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">전화번호</span>
            <span className="profile-info-value">
              {user?.phone ? formatPhone(user.phone) : '-'}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">나이</span>
            <span className="profile-info-value">
              {user?.age != null ? `${user.age}세` : '-'}
            </span>
          </div>
        </div>
      </section>

      {/* 예약 내역 */}
      <section className="mypage-card" aria-labelledby="reservation-heading">
        <div className="mypage-card-header">
          <div className="mypage-card-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 id="reservation-heading" className="mypage-card-title">예약 내역</h2>
        </div>

        <div className="reservation-tabs" role="tablist">
          <button
            className={`reservation-tab ${activeTab === 'all' ? 'active' : ''}`}
            role="tab"
            aria-pressed={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          >
            전체
          </button>
          <button
            className={`reservation-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            role="tab"
            aria-pressed={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
          >
            예정된 예약
          </button>
          <button
            className={`reservation-tab ${activeTab === 'past' ? 'active' : ''}`}
            role="tab"
            aria-pressed={activeTab === 'past'}
            onClick={() => setActiveTab('past')}
          >
            지난 예약
          </button>
        </div>

        {isReservationsLoading ? (
          <div className="reservation-loading">불러오는 중...</div>
        ) : filteredReservations.length === 0 ? (
          <EmptyState
            icon="📋"
            title="예약 내역이 없습니다"
            description="아직 예약한 시술이 없어요. 원하는 스타일을 찾아보세요!"
            actionLabel="메뉴 보기"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="reservation-list">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
                isCancelling={cancelMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* 계정 관리 */}
      <section className="mypage-card" aria-labelledby="account-heading">
        <div className="mypage-card-header">
          <div className="mypage-card-icon gray">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h2 id="account-heading" className="mypage-card-title">계정 관리</h2>
        </div>

        <div className="account-actions">
          <button className="logout-button" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            로그아웃
          </button>
        </div>
      </section>

      <ConfirmModal
        isOpen={cancelTargetId !== null}
        onClose={() => setCancelTargetId(null)}
        onConfirm={() => cancelTargetId !== null && cancelMutation.mutate(cancelTargetId)}
        title="예약을 취소하시겠습니까?"
        description="취소된 예약은 되돌릴 수 없습니다."
        confirmLabel="예약 취소"
        cancelLabel="돌아가기"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}

interface ReservationCardProps {
  reservation: ReservationResponse;
  onCancel: (id: number) => void;
  isCancelling: boolean;
}

function ReservationCard({ reservation, onCancel, isCancelling }: ReservationCardProps) {
  const startTime = apiTimeToDisplay(reservation.startTime);
  const endTime = apiTimeToDisplay(reservation.endTime);
  const statusClass = reservation.status.toLowerCase();

  return (
    <div className="reservation-card">
      <div className="reservation-card-header">
        <span className={`reservation-status status-${statusClass}`}>
          {STATUS_LABEL[reservation.status]}
        </span>
        <span className="reservation-date">{reservation.reservationDate}</span>
      </div>

      <div className="reservation-card-body">
        <span className="reservation-menu-name">{reservation.menuName}</span>
        <span className="reservation-time">{startTime} ~ {endTime}</span>

        {reservation.options.length > 0 && (
          <div className="reservation-options">
            {reservation.options.map((opt, i) => (
              <span key={i} className="reservation-option-tag">{opt.optionName}</span>
            ))}
          </div>
        )}

        <span className="reservation-price">{formatPrice(reservation.totalPrice)}</span>
      </div>

      {reservation.status === 'CONFIRMED' && (
        <div className="reservation-card-actions">
          <button
            className="reservation-cancel-button"
            onClick={() => onCancel(reservation.id)}
            disabled={isCancelling}
          >
            {isCancelling ? '취소 중...' : '예약 취소'}
          </button>
        </div>
      )}
    </div>
  );
}
