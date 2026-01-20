import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './Header.css';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <header className={`header ${isAuthPage ? 'header-minimal' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 14C9 11.2386 11.2386 9 14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="3" fill="currentColor"/>
            </svg>
          </span>
          <span className="logo-text">CutStory</span>
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <div className="user-badge">
                <span className="user-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </span>
                <span className="user-name">{user?.name}님</span>
              </div>
              <button className="header-btn header-btn-outline" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-btn header-btn-ghost">
                로그인
              </Link>
              <Link to="/signup" className="header-btn header-btn-primary">
                시작하기
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
