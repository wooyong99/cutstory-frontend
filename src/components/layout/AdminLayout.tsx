import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './AdminLayout.css';

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="메뉴 토글"
          >
            <span className="admin-hamburger-line" />
            <span className="admin-hamburger-line" />
            <span className="admin-hamburger-line" />
          </button>
          <span className="admin-header-title">CutStory Admin</span>
        </div>
        <button className="admin-logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      </header>
      <div className="admin-body">
        {sidebarOpen && (
          <div className="admin-sidebar-overlay" onClick={closeSidebar} />
        )}
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
          <nav className="admin-nav">
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={closeSidebar}>
              회원 관리
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={closeSidebar}>
              카테고리 관리
            </NavLink>
            <NavLink to="/admin/menus" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={closeSidebar}>
              메뉴 관리
            </NavLink>
            <NavLink to="/admin/reservations" className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`} onClick={closeSidebar}>
              예약 관리
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
