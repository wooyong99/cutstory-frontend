import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout, AdminLayout } from './components/layout';
import { SignupPage, LoginPage, MainPage, StyleDetailPage, MyPage, AdminLoginPage, AdminSignupPage, UsersPage, CategoriesPage, MenusPage, MenuCreatePage } from './pages';
import { useInitAuth } from './hooks/useInitAuth';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function GuestOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AuthOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function AdminGuestOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/admin/users" replace />;
  }
  return children;
}

function AppRoutes() {
  useInitAuth();

  return (
    <Routes>
      {/* 일반 사용자 라우트 */}
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/styles/:styleId" element={<StyleDetailPage />} />
        <Route path="/mypage" element={<AuthOnly><MyPage /></AuthOnly>} />
      </Route>

      {/* 관리자 인증 라우트 */}
      <Route path="/admin/login" element={<AdminGuestOnly><AdminLoginPage /></AdminGuestOnly>} />
      <Route path="/admin/signup" element={<AdminGuestOnly><AdminSignupPage /></AdminGuestOnly>} />

      {/* 관리자 보호 라우트 */}
      <Route path="/admin" element={<AdminOnly><AdminLayout /></AdminOnly>}>
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="menus" element={<MenusPage />} />
        <Route path="menus/create" element={<MenuCreatePage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
