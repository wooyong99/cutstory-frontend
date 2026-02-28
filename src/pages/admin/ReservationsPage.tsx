import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminReservations, adminCancelReservation, adminCompleteReservation } from '../../services/api';
import { apiTimeToDisplay, formatPrice } from '../../utils/timeSlot';
import type { ReservationStatus, AdminReservationResponse } from '../../types';
import './AdminPage.css';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: '예약 확정',
  CANCELLED: '취소됨',
  COMPLETED: '완료',
};

const STATUS_CLASS: Record<ReservationStatus, string> = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateShort(date: string): string {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

type StatusFilter = 'ALL' | ReservationStatus;

export function ReservationsPage() {
  const today = getToday();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const queryClient = useQueryClient();

  const dateRange = useMemo(() => getDatesBetween(startDate, endDate), [startDate, endDate]);
  const isRangeValid = dateRange.length > 0 && dateRange.length <= 31;

  // 날짜 범위 내 각 날짜를 병렬 조회
  const { data: allReservations, isLoading, isError } = useQuery({
    queryKey: ['admin', 'reservations', startDate, endDate],
    queryFn: async () => {
      const results = await Promise.all(
        dateRange.map((date) => fetchAdminReservations(date).catch(() => [] as AdminReservationResponse[]))
      );
      return results.flat();
    },
    enabled: isRangeValid,
  });

  const completeMutation = useMutation({
    mutationFn: adminCompleteReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: adminCancelReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
    },
  });

  // 상태 필터 적용
  const filteredReservations = useMemo(() => {
    if (!allReservations) return [];
    const list = statusFilter === 'ALL'
      ? allReservations
      : allReservations.filter((r) => r.status === statusFilter);
    return list.sort((a, b) => {
      const dateCompare = a.reservationDate.localeCompare(b.reservationDate);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [allReservations, statusFilter]);

  // 상태별 개수 요약
  const statusCounts = useMemo(() => {
    if (!allReservations) return { ALL: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0 };
    return {
      ALL: allReservations.length,
      CONFIRMED: allReservations.filter((r) => r.status === 'CONFIRMED').length,
      CANCELLED: allReservations.filter((r) => r.status === 'CANCELLED').length,
      COMPLETED: allReservations.filter((r) => r.status === 'COMPLETED').length,
    };
  }, [allReservations]);

  const handleComplete = (id: number) => {
    if (window.confirm('예약을 완료 처리하시겠습니까?')) {
      completeMutation.mutate(id);
    }
  };

  const handleCancel = (id: number) => {
    if (window.confirm('예약을 취소하시겠습니까?')) {
      cancelMutation.mutate(id);
    }
  };

  const setQuickRange = (days: number) => {
    setStartDate(today);
    const end = new Date();
    end.setDate(end.getDate() + days);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (value > endDate) setEndDate(value);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (value < startDate) setStartDate(value);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">예약 관리</h1>
        <p className="admin-page-description">기간별 예약 현황을 확인하고 관리합니다.</p>
      </div>

      {/* 검색 필터 영역 */}
      <div className="rv-filter-card">
        <div className="rv-filter-row">
          <div className="rv-date-range">
            <label className="rv-filter-label">조회 기간</label>
            <div className="rv-date-inputs">
              <input
                type="date"
                className="rv-date-input"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
              <span className="rv-date-separator">~</span>
              <input
                type="date"
                className="rv-date-input"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
          </div>
          <div className="rv-quick-buttons">
            <button
              type="button"
              className={`rv-quick-btn ${startDate === today && endDate === today ? 'active' : ''}`}
              onClick={() => { setStartDate(today); setEndDate(today); }}
            >
              오늘
            </button>
            <button type="button" className="rv-quick-btn" onClick={() => setQuickRange(6)}>
              이번 주
            </button>
            <button type="button" className="rv-quick-btn" onClick={() => setQuickRange(29)}>
              이번 달
            </button>
          </div>
        </div>

        {!isRangeValid && (
          <p className="rv-filter-warn">최대 31일까지 조회할 수 있습니다.</p>
        )}
      </div>

      {/* 상태 요약 카드 */}
      <div className="rv-summary-row">
        {([
          { key: 'ALL' as StatusFilter, label: '전체', color: '#6b7280' },
          { key: 'CONFIRMED' as StatusFilter, label: '예약 확정', color: '#6366f1' },
          { key: 'COMPLETED' as StatusFilter, label: '완료', color: '#10b981' },
          { key: 'CANCELLED' as StatusFilter, label: '취소', color: '#dc2626' },
        ]).map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            className={`rv-summary-card ${statusFilter === key ? 'active' : ''}`}
            onClick={() => setStatusFilter(key)}
            style={{ '--summary-color': color } as React.CSSProperties}
          >
            <span className="rv-summary-count">{statusCounts[key]}</span>
            <span className="rv-summary-label">{label}</span>
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="admin-table-wrapper">
        {isLoading ? (
          <div className="admin-state-box">불러오는 중...</div>
        ) : isError ? (
          <div className="admin-state-box error">예약 목록을 불러오지 못했습니다.</div>
        ) : filteredReservations.length === 0 ? (
          <div className="admin-state-box">
            {statusFilter === 'ALL' ? '해당 기간의 예약이 없습니다.' : `해당 기간의 ${STATUS_LABEL[statusFilter as ReservationStatus]} 예약이 없습니다.`}
          </div>
        ) : (
          <>
            <div className="rv-table-info">
              <span>총 {filteredReservations.length}건</span>
              {startDate !== endDate && (
                <span className="rv-table-range">{startDate} ~ {endDate}</span>
              )}
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>회원ID</th>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>메뉴</th>
                  <th>옵션</th>
                  <th>총 금액</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.userId}</td>
                    <td>
                      <span className="rv-cell-date">{formatDateShort(r.reservationDate)}</span>
                    </td>
                    <td className="rv-cell-time">{apiTimeToDisplay(r.startTime)}~{apiTimeToDisplay(r.endTime)}</td>
                    <td>{r.menuName}</td>
                    <td>
                      {r.options.length > 0
                        ? r.options.map((o) => o.optionName).join(', ')
                        : '-'}
                    </td>
                    <td className="rv-cell-price">{formatPrice(r.totalPrice)}</td>
                    <td>
                      <span className={`role-badge ${STATUS_CLASS[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td>
                      {r.status === 'CONFIRMED' ? (
                        <div className="admin-action-buttons">
                          <button
                            className="admin-create-button"
                            onClick={() => handleComplete(r.id)}
                            disabled={completeMutation.isPending}
                          >
                            완료
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleCancel(r.id)}
                            disabled={cancelMutation.isPending}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
