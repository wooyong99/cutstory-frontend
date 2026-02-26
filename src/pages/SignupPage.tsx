import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signup, ApiException } from '../services/api';
import type { SignupFormData } from '../types';
import './LoginPage.css';

interface FormErrors {
  name?: string;
  age?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    age: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const signupMutation = useMutation({
    mutationFn: () => signup(formData),
    onSuccess: () => {
      navigate('/login');
    },
  });

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return '이름을 입력해주세요.';
        if (value.length < 2) return '이름은 2자 이상이어야 합니다.';
        return undefined;
      case 'age':
        if (!value) return '나이를 입력해주세요.';
        const age = parseInt(value, 10);
        if (isNaN(age) || age < 1) return '올바른 나이를 입력해주세요.';
        if (age > 150) return '올바른 나이를 입력해주세요.';
        return undefined;
      case 'email':
        if (!value.trim()) return '이메일을 입력해주세요.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return '이메일 형식이 올바르지 않습니다.';
        return undefined;
      case 'phone':
        if (!value.trim()) return '휴대폰 번호를 입력해주세요.';
        const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
        if (!phoneRegex.test(value.replace(/-/g, ''))) {
          return '휴대폰 번호 형식이 올바르지 않습니다.';
        }
        return undefined;
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.';
        if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
        return undefined;
      default:
        return undefined;
    }
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'phone') {
      newValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, newValue) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField('name', formData.name),
      age: validateField('age', formData.age),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);
    setTouched({ name: true, age: true, email: true, phone: true, password: true });

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    signupMutation.mutate();
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* 왼쪽 비주얼 영역 */}
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="visual-badge">Join Us</div>
            <h2 className="visual-title">
              새로운 시작을
              <br />함께해요
            </h2>
            <p className="visual-description">
              CutStory와 함께 특별한 경험을 시작하세요.
              <br />회원만을 위한 다양한 혜택이 기다리고 있어요.
            </p>
            <div className="visual-features">
              <div className="feature-item">
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>첫 예약 10% 할인</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>생일 특별 쿠폰 증정</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>우선 예약 혜택</span>
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
              <h1 className="auth-title">회원가입</h1>
              <p className="auth-subtitle">새 계정을 만들어보세요</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name" className="form-label">
                    이름 <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 16C3 12.6863 5.68629 10 9 10C12.3137 10 15 12.6863 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`form-input ${errors.name && touched.name ? 'error' : ''}`}
                      placeholder="이름을 입력하세요"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <p className="form-error">{errors.name}</p>
                  )}
                </div>

                <div className="form-field form-field-small">
                  <label htmlFor="age" className="form-label">
                    나이 <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M6 1V4M12 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M3 7H15" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </span>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      className={`form-input ${errors.age && touched.age ? 'error' : ''}`}
                      placeholder="나이"
                      value={formData.age}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min="1"
                      max="150"
                      disabled={signupMutation.isPending}
                    />
                  </div>
                  {errors.age && touched.age && (
                    <p className="form-error">{errors.age}</p>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email" className="form-label">
                  이메일 <span className="required">*</span>
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
                    disabled={signupMutation.isPending}
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  비밀번호 <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="4" y="8" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M6 8V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                    placeholder="8자 이상 입력하세요"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                  />
                </div>
                {errors.password && touched.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="phone" className="form-label">
                  휴대폰 번호 <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="4" y="1" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M7 14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${errors.phone && touched.phone ? 'error' : ''}`}
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={signupMutation.isPending}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="form-error">{errors.phone}</p>
                )}
              </div>

              {signupMutation.isError && (
                <div className="form-error-box">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
                  </svg>
                  <span>
                    {signupMutation.error instanceof ApiException
                      ? signupMutation.error.errorMessage
                      : '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <>
                    <span className="button-spinner" />
                    가입 중...
                  </>
                ) : (
                  '가입하기'
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                이미 계정이 있으신가요? <Link to="/login" className="auth-link">로그인</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
