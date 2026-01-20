import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signup } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { SignupFormData } from '../types';
import './SignupPage.css';

interface FormErrors {
  name?: string;
  age?: string;
  email?: string;
  phone?: string;
}

export function SignupPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    age: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const signupMutation = useMutation({
    mutationFn: () => signup(formData),
    onSuccess: (user) => {
      login(user);
      navigate('/');
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
          return '휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)';
        }
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
    };

    setErrors(newErrors);
    setTouched({ name: true, age: true, email: true, phone: true });

    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    signupMutation.mutate();
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h1 className="signup-title">회원가입</h1>
        <p className="signup-subtitle">CutStory에 오신 것을 환영합니다</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              이름 <span className="required">*</span>
            </label>
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
            {errors.name && touched.name && (
              <p className="form-error">{errors.name}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="age" className="form-label">
              나이 <span className="required">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              className={`form-input ${errors.age && touched.age ? 'error' : ''}`}
              placeholder="나이를 입력하세요"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              min="1"
              max="150"
              disabled={signupMutation.isPending}
            />
            {errors.age && touched.age && (
              <p className="form-error">{errors.age}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email" className="form-label">
              이메일 <span className="required">*</span>
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
              disabled={signupMutation.isPending}
            />
            {errors.email && touched.email && (
              <p className="form-error">{errors.email}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              휴대폰 번호 <span className="required">*</span>
            </label>
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
            {errors.phone && touched.phone && (
              <p className="form-error">{errors.phone}</p>
            )}
          </div>

          {signupMutation.isError && (
            <p className="form-error submit-error">
              회원가입 중 오류가 발생했습니다. 다시 시도해주세요.
            </p>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p className="signup-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
