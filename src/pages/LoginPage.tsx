import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login as loginApi, fetchMe, ApiException } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import './LoginPage.css';

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: loginStore, setUser } = useAuthStore();

  const from = (location.state as { from?: string })?.from || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loginMutation = useMutation({
    mutationFn: () => loginApi(formData.email, formData.password),
    onSuccess: async ({ accessToken }) => {
      loginStore(accessToken);
      try {
        const user = await fetchMe();
        setUser(user);
      } catch {
        // 사용자 정보 조회 실패해도 로그인은 유지
      }
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
        if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
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

  const isFormValid =
    !validateField('email', formData.email) &&
    !validateField('password', formData.password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    loginMutation.mutate();
  };

  return (
    <div className="auth-page">
      <title>로그인 - 컷스토리 헤어살롱</title>
      <meta name="robots" content="noindex, nofollow" />

      <div className="auth-container">
        {/* 왼쪽 비주얼 영역 */}
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="visual-badge">Welcome Back</div>
            <h2 className="visual-title">
              다시 만나서
              <br />반가워요
            </h2>
            <p className="visual-description">
              로그인하고 예약을 관리하세요.
              <br />특별한 혜택이 기다리고 있어요.
            </p>
            <div className="visual-features">
              <div className="feature-item">
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>간편한 예약 관리</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>예약 알림 서비스</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>회원 전용 할인 혜택</span>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 폼 영역 */}
        <div className="auth-form-wrapper">
          <div className="auth-form-container">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 14C9 11.2386 11.2386 9 14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="14" cy="14" r="3" fill="currentColor"/>
                </svg>
                <span>CutStory</span>
              </Link>
              <h1 className="auth-title">로그인</h1>
              <p className="auth-subtitle">계정에 로그인하세요</p>
            </div>

            <a
              href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/kakao`}
              className="kakao-login-button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.58 1 1 3.79 1 7.21C1 9.28 2.44 11.1 4.59 12.17L3.72 15.56C3.66 15.78 3.91 15.96 4.1 15.83L8.05 13.28C8.36 13.31 8.68 13.33 9 13.33C13.42 13.33 17 10.54 17 7.12C17 3.79 13.42 1 9 1Z" fill="currentColor"/>
              </svg>
              카카오로 로그인
            </a>

            <div className="auth-divider">
              <span>또는</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="email" className="form-label">
                  이메일
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 6L9 10.5L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
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
                </div>
                {errors.email && touched.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  비밀번호
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="3" y="7" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 7V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V7" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
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
                </div>
                {errors.password && touched.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              {loginMutation.isError && (
                <div className="form-error-box">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
                  </svg>
                  <span>
                    {loginMutation.error instanceof ApiException
                      ? loginMutation.error.errorMessage
                      : '이메일 또는 비밀번호가 올바르지 않습니다.'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={!isFormValid || loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <span className="button-spinner" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                계정이 없으신가요? <Link to="/signup" className="auth-link">회원가입</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
