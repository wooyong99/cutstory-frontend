# 로그인 API 연동

## 엔드포인트

```
POST /api/v1/auth/login
```

**Base URL:** `https://api.cut-story.com`
**Content-Type:** `application/json`

## 요청 (Request)

### LoginRequest

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `email` | string | O | 이메일 주소 |
| `password` | string | O | 비밀번호 |

### 요청 예시

```json
{
  "email": "hong@example.com",
  "password": "password123"
}
```

## 응답 (Response)

공통 응답 구조 `ApiResponse<LoginResponse>`를 사용합니다.
(공통 응답 구조는 [SIGNUP_API.md](./SIGNUP_API.md#공통-응답-구조---apiresponset) 참고)

### LoginResponse (data)

| 필드 | 타입 | 설명 |
|------|------|------|
| `accessToken` | string | JWT 인증 토큰 |

### 성공 응답 예시

```json
{
  "isSuccess": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  },
  "error": null
}
```

### 실패 응답 예시

```json
{
  "isSuccess": false,
  "data": null,
  "error": {
    "errorCode": "INVALID_CREDENTIALS",
    "errorMessage": "이메일 또는 비밀번호가 올바르지 않습니다."
  }
}
```

## 클라이언트 구현

### 관련 파일

| 파일 | 설명 |
|------|------|
| `src/types/index.ts` | `LoginResponse`, `LoginFormData` 타입 정의 |
| `src/services/api.ts` | `login()` 함수 |
| `src/stores/authStore.ts` | `accessToken` 저장 및 인증 상태 관리 |
| `src/pages/LoginPage.tsx` | 로그인 폼 UI 및 API 호출 |

### 인증 흐름

```
1. 사용자가 이메일/비밀번호 입력 후 로그인 버튼 클릭
2. POST /api/v1/auth/login 호출
3. 성공 시:
   └→ accessToken을 authStore에 저장 (localStorage 영속화)
   └→ isAuthenticated = true
   └→ GET /api/v1/users/me 호출하여 사용자 프로필 조회
   └→ user 정보를 authStore에 저장
   └→ 이전 페이지 또는 메인으로 이동
4. 실패 시:
   └→ ApiException의 errorMessage를 화면에 표시
5. 앱 새로고침 시:
   └→ useInitAuth 훅이 토큰은 있지만 user가 없으면 자동으로 /users/me 재조회
   └→ 토큰 만료 등으로 실패하면 자동 로그아웃
```

### 사용자 프로필 조회 (`GET /api/v1/users/me`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | number (int64) | 사용자 ID |
| `email` | string | 이메일 |
| `username` | string | 사용자 이름 |
| `age` | number (int32) | 나이 |
| `phone` | string | 전화번호 |
| `role` | string | 권한 (`USER`, `ADMIN`) |

### authStore 상태 구조

```typescript
interface AuthState {
  user: User | null;         // 사용자 프로필 정보
  accessToken: string | null; // JWT 토큰
  isAuthenticated: boolean;   // 인증 여부
  login: (accessToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}
```

- `login(accessToken)`: 토큰 저장 + 인증 상태 설정
- `setUser(user)`: 사용자 프로필 정보 저장
- `logout()`: 토큰, 사용자 정보, 인증 상태 모두 초기화

### 회원가입 후 흐름

회원가입 API(`POST /api/v1/auth/sign-up`)는 토큰을 반환하지 않으므로, 회원가입 성공 시 로그인 페이지(`/login`)로 리다이렉트합니다.
