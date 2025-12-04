# GPT-4b FE

선물 추천을 위한 최고의 선택, GPT-4b 서비스의 프론트엔드 애플리케이션입니다.

## 기능

- AI 맞춤형 선물 추천
- 명함 관리, 등록 및 저장
- 캘린더 일정 관리
- 중요 알림 및 리마인더

## 기술 스택

- React 18
- React Router 6
- Vite
- CSS Modules

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   └── BottomNavigation.jsx
├── pages/              # 페이지 컴포넌트
│   ├── WelcomeScreen.jsx
│   ├── LoginScreen.jsx
│   ├── LandingPage.jsx
│   ├── BusinessCardWallet.jsx
│   └── CalendarPage.jsx
├── App.jsx            # 메인 앱 컴포넌트
├── main.jsx           # 진입점
└── index.css          # 전역 스타일
```

## 주요 화면

1. **시작 화면** (`/`) - 서비스 시작 시 환영 메시지
2. **로그인 화면** (`/login`) - 이메일/비밀번호 로그인
3. **대시보드** (`/dashboard`) - 인기 선물 추천 및 중요 알림 (랜딩페이지)
4. **명함지갑** (`/business-cards`) - 명함 검색 및 관리
5. **캘린더** (`/calendar`) - 일정 관리

## 개발 참고사항
- Figma 디자인 기반 구현 (https://www.figma.com/design/MBZaFkxybrhuZ3sL2aNBqn/HCI?node-id=0-1&t=sJTh5tk6ipHQaqzN-1)

