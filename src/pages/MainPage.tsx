import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMenuItems } from '../services/api';
import { Loading, ErrorMessage, EmptyState } from '../components/common';
import { formatDuration, formatPrice } from '../utils/timeSlot';
import { CATEGORY_LABELS, type MenuItem, type MenuCategory } from '../types';
import './MainPage.css';

export function MainPage() {
  const {
    data: menuItems,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  });

  // 카테고리별로 그룹화
  const groupedMenus = useMemo(() => {
    if (!menuItems) return null;

    const groups: Record<MenuCategory, MenuItem[]> = {
      cut: [],
      color: [],
      perm: [],
    };

    menuItems.forEach((item) => {
      groups[item.category].push(item);
    });

    return groups;
  }, [menuItems]);

  if (isLoading) {
    return <Loading message="메뉴를 불러오는 중..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message="메뉴 목록을 불러오는데 실패했습니다."
        onRetry={() => refetch()}
      />
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <EmptyState
        icon="💇"
        title="현재 예약 가능한 메뉴가 없습니다"
        description="잠시 후 다시 시도해주세요."
        actionLabel="새로고침"
        onAction={() => refetch()}
      />
    );
  }

  const categories: MenuCategory[] = ['cut', 'color', 'perm'];

  return (
    <div className="main-page">
      <header className="main-header">
        <h1 className="main-title">메뉴 & 가격</h1>
        <p className="main-subtitle">원하는 시술을 선택하고 예약하세요</p>
      </header>

      {categories.map((category) => {
        const items = groupedMenus?.[category] || [];
        if (items.length === 0) return null;

        return (
          <section key={category} className="menu-category">
            <h2 className="category-title">{CATEGORY_LABELS[category]}</h2>
            <div className="menu-list">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface MenuCardProps {
  item: MenuItem;
}

function MenuCard({ item }: MenuCardProps) {
  return (
    <Link to={`/styles/${item.id}`} className="menu-card">
      <div className="menu-card-content">
        <div className="menu-card-info">
          <h3 className="menu-card-name">{item.name}</h3>
          {item.description && (
            <p className="menu-card-description">{item.description}</p>
          )}
          <span className="menu-card-duration">{formatDuration(item.durationMinutes)}</span>
        </div>
        <div className="menu-card-price">
          <span className="price-value">
            {formatPrice(item.basePrice)}
            {item.priceNote && <span className="price-note">{item.priceNote}</span>}
          </span>
        </div>
      </div>
      {item.options && item.options.length > 0 && (
        <div className="menu-card-options">
          {item.options.map((opt) => (
            <span key={opt.id} className="option-tag">
              +{opt.name} ({formatPrice(opt.price)})
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
