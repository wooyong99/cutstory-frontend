import { useMemo } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { days, monthLabel } = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    const daysInMonth: Array<{
      date: Date | null;
      dateString: string;
      isToday: boolean;
      isPast: boolean;
    }> = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      daysInMonth.push({ date: null, dateString: '', isToday: false, isPast: true });
    }

    // 현재 달의 날짜
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      const isPast = date < today;

      daysInMonth.push({ date, dateString, isToday, isPast });
    }

    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월',
    ];

    return {
      days: daysInMonth,
      monthLabel: `${year}년 ${monthNames[month]}`,
    };
  }, []);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3 className="calendar-month">{monthLabel}</h3>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`calendar-weekday ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((day, index) => {
          if (!day.date) {
            return <div key={`empty-${index}`} className="calendar-day empty" />;
          }

          const isSelected = selectedDate === day.dateString;
          const dayOfWeek = day.date.getDay();
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <button
              key={day.dateString}
              type="button"
              className={`calendar-day ${isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${day.isPast ? 'past' : ''} ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}`}
              onClick={() => !day.isPast && onSelectDate(day.dateString)}
              disabled={day.isPast}
              aria-label={`${day.date.getMonth() + 1}월 ${day.date.getDate()}일`}
              aria-pressed={isSelected}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
