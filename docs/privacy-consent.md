# 회원가입 개인정보 약관 동의

## 작업 배경 및 목적

회원가입 시 개인정보 수집·이용 동의(필수)와 마케팅 수신 동의(선택)를 받아야 한다.
추후 이메일, 문자로 마케팅 연락이 갈 예정이므로 법적 동의를 사전에 확보한다.
동의 정보는 백엔드 API(SignUpRequest)에도 전달하여 서버에 저장한다.

## 동의 항목 구성

| 항목 | 구분 | 설명 |
|------|------|------|
| 개인정보 수집·이용 동의 | 필수 | 서비스 제공을 위한 최소한의 개인정보 수집 동의 |
| 마케팅 정보 수신 동의 | 선택 | 이메일, 문자를 통한 할인·이벤트 정보 수신 동의 |

## 수집하는 개인정보 항목

- 이름
- 나이
- 이메일
- 전화번호

**수집 목적:** 서비스 제공 및 예약 관리
**보유 기간:** 회원 탈퇴 시까지

## 프론트엔드 변경 사항

### 타입 수정 (`src/types/index.ts`)

`SignupFormData`, `SignUpRequest`에 다음 필드 추가:

- `privacyConsent: boolean` — 개인정보 수집·이용 동의 (필수)
- `marketingConsent: boolean` — 마케팅 수신 동의 (선택)

### API 수정 (`src/services/api.ts`)

`signup()` 함수의 request 객체에 동의 필드 매핑 추가.

### 회원가입 페이지 (`src/pages/SignupPage.tsx`)

- 초기 state에 `privacyConsent: false`, `marketingConsent: false` 추가
- 개인정보 동의 미체크 시 유효성 검증 에러 표시
- 커스텀 체크박스 UI (indigo 테마)
- 필수/선택 뱃지로 구분 표시

### 스타일 (`src/pages/LoginPage.css`)

`.auth-form` 스코프 하위에 동의 체크박스 관련 스타일 추가.

## 백엔드 연동 필드 (SignUpRequest)

```json
{
  "username": "string",
  "age": 0,
  "email": "string",
  "phone": "string",
  "password": "string",
  "privacyConsent": true,
  "marketingConsent": false
}
```

## 향후 고려 사항

- 약관 상세 페이지 링크 연결 (개인정보 처리방침 전문)
- 동의 철회 기능 (마이페이지에서 마케팅 수신 동의 변경)
- 동의 이력 관리 (동의 일시, 변경 이력 등)
- 제3자 제공 동의 항목 추가 가능성
