# 회원가입 API 연동

## 엔드포인트

```
POST /api/v1/auth/sign-up
```

**Base URL:** `https://api.cut-story.com`
**Content-Type:** `application/json`

## 요청 (Request)

### SignUpRequest

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `username` | string | O | 사용자 이름 |
| `age` | integer | O | 나이 |
| `email` | string | O | 이메일 주소 |
| `phone` | string | O | 전화번호 (하이픈 제거, 예: `01012345678`) |
| `password` | string | O | 비밀번호 (8자 이상) |

### 요청 예시

```json
{
  "username": "홍길동",
  "age": 25,
  "email": "hong@example.com",
  "phone": "01012345678",
  "password": "password123"
}
```

## 응답 (Response)

### 공통 응답 구조 - ApiResponse\<T\>

모든 API는 아래 공통 응답 구조를 사용합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `isSuccess` | boolean | 요청 성공 여부 |
| `data` | T (nullable) | 성공 시 응답 데이터 |
| `error` | ApiError (nullable) | 실패 시 에러 정보 |

### ApiError

| 필드 | 타입 | 설명 |
|------|------|------|
| `errorCode` | string | 에러 코드 (예: `DUPLICATE_EMAIL`) |
| `errorMessage` | string | 사용자에게 표시할 에러 메시지 |

### 성공 응답 예시

```json
{
  "isSuccess": true,
  "data": {
    "id": "1",
    "name": "홍길동",
    "age": 25,
    "email": "hong@example.com",
    "phone": "01012345678"
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
    "errorCode": "DUPLICATE_EMAIL",
    "errorMessage": "이미 가입된 이메일입니다."
  }
}
```

## 클라이언트 구현

### 관련 파일

| 파일 | 설명 |
|------|------|
| `src/types/index.ts` | `ApiResponse<T>`, `ApiError`, `SignUpRequest`, `SignupFormData` 타입 정의 |
| `src/services/api.ts` | `apiClient` 헬퍼, `signup()` 함수, `ApiException` 클래스 |
| `src/pages/SignupPage.tsx` | 회원가입 폼 UI 및 API 호출 |

### 주요 구현 사항

#### 1. 공통 API 클라이언트 (`apiClient`)

`apiClient<T>(endpoint, options)` 함수는 모든 API 호출의 공통 로직을 처리합니다:

- `API_BASE_URL` + `endpoint`로 fetch 호출
- 응답의 `isSuccess` 필드 확인
- 실패 시 `ApiException` throw (errorCode, errorMessage 포함)
- 성공 시 `data` 필드 반환

#### 2. 폼 데이터 → API 요청 변환

`SignupFormData`(폼)와 `SignUpRequest`(API) 간의 필드 매핑:

| 폼 필드 (SignupFormData) | API 필드 (SignUpRequest) | 변환 |
|--------------------------|--------------------------|------|
| `name` | `username` | 이름 변경 |
| `age` | `age` | string → number (`parseInt`) |
| `email` | `email` | 그대로 |
| `phone` | `phone` | 하이픈 제거 (`replace(/-/g, '')`) |
| `password` | `password` | 그대로 |

#### 3. 에러 처리

```
API 응답 (isSuccess: false)
  └→ ApiException throw (errorCode, errorMessage)
      └→ SignupPage에서 catch
          └→ ApiException이면 errorMessage 표시
          └→ 그 외 에러면 기본 메시지 표시
```

### 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE_URL` | `https://api.cut-story.com` | API 서버 주소 |

`.env` 파일에서 오버라이드 가능:

```env
VITE_API_BASE_URL=http://localhost:8080
```
