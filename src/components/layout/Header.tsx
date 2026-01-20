import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './Header.css';

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          CutStory
        </Link>
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <span className="header-user">{user?.name}님</span>
              <button className="header-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">
                로그인
              </Link>
              <Link to="/signup" className="header-button-primary">
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
