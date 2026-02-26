import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMenuItems } from '../services/api';
import { Loading, ErrorMessage, EmptyState } from '../components/common';
import { useAuthStore } from '../stores/authStore';
import { formatDuration, formatPrice } from '../utils/timeSlot';
import { CATEGORY_LABELS, type MenuItem, type MenuCategory } from '../types';
import './MainPage.css';

const CATEGORY_ICONS: Record<MenuCategory, string> = {
  cut: '✂️',
  color: '🎨',
  perm: '💫',
};

const CATEGORY_IMAGES: Record<MenuCategory, string> = {
  cut: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
  color: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop',
  perm: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&fit=crop',
};

export function MainPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');

  const {
    data: menuItems,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: fetchMenuItems,
  });

  // 필터링된 메뉴
  const filteredMenus = useMemo(() => {
    if (!menuItems) return [];
    if (activeCategory === 'all') return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [menuItems, activeCategory]);

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
      {/* 히어로 섹션 */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Premium Hair Salon</span>
          <h1 className="hero-title">
            당신만의 <span className="gradient-text">특별한 스타일</span>을
            <br />찾아드립니다
          </h1>
          <p className="hero-description">
            전문 헤어 디자이너와 함께 새로운 나를 만나보세요.
            <br />지금 바로 원하는 시술을 예약하세요.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">년 경력</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">5,000+</span>
              <span className="stat-label">고객 만족</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">4.9</span>
              <span className="stat-label">평점</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-grid">
            {categories.map((cat) => (
              <div key={cat} className="hero-image-item">
                <img src={CATEGORY_IMAGES[cat]} alt={CATEGORY_LABELS[cat]} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 필터 */}
      <section className="filter-section">
        <div className="filter-header">
          <h2 className="section-title">메뉴 & 가격</h2>
          <p className="section-subtitle">원하는 시술을 선택하고 바로 예약하세요</p>
        </div>

        <div className="category-tabs">
          <button
            type="button"
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="tab-icon">{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </section>

      {/* 메뉴 그리드 */}
      <section className="menu-section">
        <div className="menu-grid">
          {filteredMenus.map((item, index) => (
            <MenuCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* CTA 섹션 - 비로그인 사용자만 */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">첫 방문 고객 할인</h2>
            <p className="cta-description">
              회원가입 후 첫 예약 시 10% 할인 혜택을 드립니다
            </p>
            <Link to="/signup" className="cta-button">
              지금 시작하기
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

function MenuCard({ item, index }: MenuCardProps) {
  const categoryImage = CATEGORY_IMAGES[item.category];

  return (
    <Link
      to={`/styles/${item.id}`}
      className="menu-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="menu-card-image">
        <img src={categoryImage} alt={item.name} />
        <div className="menu-card-overlay" />
        <span className="menu-card-category">
          {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
        </span>
      </div>

      <div className="menu-card-body">
        <div className="menu-card-header">
          <h3 className="menu-card-name">{item.name}</h3>
          <span className="menu-card-price">
            {formatPrice(item.basePrice)}
            {item.priceNote && <span className="price-suffix">{item.priceNote}</span>}
          </span>
        </div>

        {item.description && (
          <p className="menu-card-description">{item.description}</p>
        )}

        <div className="menu-card-footer">
          <span className="menu-card-duration">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {formatDuration(item.durationMinutes)}
          </span>

          {item.options && item.options.length > 0 && (
            <span className="menu-card-options-count">
              +{item.options.length}개 옵션
            </span>
          )}
        </div>
      </div>

      <div className="menu-card-action">
        <span>예약하기</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  );
}
