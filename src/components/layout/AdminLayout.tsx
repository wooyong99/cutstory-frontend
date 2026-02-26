import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './AdminLayout.css';

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span className="admin-header-title">CutStory Admin</span>
        <button className="admin-logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      </header>
      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              회원 관리
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              카테고리 관리
            </NavLink>
            <NavLink to="/admin/menus" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              메뉴 관리
            </NavLink>
          </nav>
        </aside>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
