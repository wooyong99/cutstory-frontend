import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { fetchMe } from '../services/api';

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, setUser } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    login(accessToken);
    fetchMe()
      .then((user) => setUser(user))
      .catch(() => {})
      .finally(() => navigate('/', { replace: true }));
  }, [searchParams, login, setUser, navigate]);

  return null;
}
