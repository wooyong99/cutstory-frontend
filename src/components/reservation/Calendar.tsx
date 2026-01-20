import { useMemo, useRef, useEffect } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function Calendar({ selectedDate, onSelectDate }: CalendarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = useMemo(() => {
    const result: Array<{
      date: Date;
      dateString: string;
      dayOfWeek: number;
      dayLabel: string;
      dateLabel: string;
      monthLabel: string;
      isToday: boolean;
    }> = [];

    // 오늘부터 30일간의 날짜 생성
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

      result.push({
        date,
        dateString: formatDate(date),
        dayOfWeek,
        dayLabel: weekDays[dayOfWeek],
        dateLabel: String(date.getDate()),
        monthLabel: `${date.getMonth() + 1}월`,
        isToday: i === 0,
      });
    }

    return result;
  }, []);

  // 선택된 날짜로 스크롤
  useEffect(() => {
    if (selectedDate && scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector(
        `[data-date="${selectedDate}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedDate]);

  return (
    <div className="date-picker">
      <div className="date-picker-scroll" ref={scrollContainerRef}>
        {days.map((day, index) => {
          const isSelected = selectedDate === day.dateString;
          const isSunday = day.dayOfWeek === 0;
          const isSaturday = day.dayOfWeek === 6;
          const showMonth = index === 0 || days[index - 1].date.getMonth() !== day.date.getMonth();

          return (
            <div key={day.dateString} className="date-item-wrapper">
              {showMonth && <span className="date-month-label">{day.monthLabel}</span>}
              <button
                type="button"
                data-date={day.dateString}
                className={`date-item ${isSelected ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}`}
                onClick={() => onSelectDate(day.dateString)}
                aria-label={`${day.date.getMonth() + 1}월 ${day.date.getDate()}일 ${day.dayLabel}요일`}
                aria-pressed={isSelected}
              >
                <span className="date-day-label">{day.dayLabel}</span>
                <span className="date-number">{day.dateLabel}</span>
              </button>
            </div>
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
