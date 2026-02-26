import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { fetchMe } from '../services/api';

export function useInitAuth() {
  const { accessToken, user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!accessToken || user) return;

    fetchMe()
      .then(setUser)
      .catch(() => {
        logout();
      });
  }, [accessToken, user, setUser, logout]);
}
