import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import './LoginPage.css';

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginStore = useAuthStore((state) => state.login);

  const from = (location.state as { from?: string })?.from || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loginMutation = useMutation({
    mutationFn: () => loginApi(formData.email, formData.password),
    onSuccess: (user) => {
      loginStore(user);
      navigate(from, { replace: true });
    },
  });

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return '이메일을 입력해주세요.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return '이메일 형식이 올바르지 않습니다.';
        return undefined;
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    loginMutation.mutate();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">로그인</h1>
        <p className="login-subtitle">계정에 로그인하세요</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loginMutation.isPending}
            />
            {errors.email && touched.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loginMutation.isPending}
            />
            {errors.password && touched.password && (
              <p className="form-error">{errors.password}</p>
            )}
          </div>

          {loginMutation.isError && (
            <p className="form-error submit-error">
              이메일 또는 비밀번호가 올바르지 않습니다.
            </p>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="login-footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
