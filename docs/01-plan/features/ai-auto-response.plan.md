# AI 자동 답변 기능 Planning Document

> **Summary**: 게시글 작성 시 AI가 웹 검색을 통해 정확한 답변을 댓글로 자동 생성하는 기능
>
> **Project**: Bulletin Board
> **Version**: 1.0.0
> **Author**: Claude AI
> **Date**: 2026-02-10
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

사용자가 게시판에 질문이나 게시글을 작성하면, AI가 자동으로 내용을 분석하고 웹 검색을 수행하여 정확한 답변을 댓글로 제공합니다. 이를 통해 사용자는 즉각적이고 신뢰할 수 있는 정보를 얻을 수 있습니다.

### 1.2 Background

- 게시판 사용자들이 질문을 올려도 답변을 받기까지 시간이 오래 걸리는 문제
- AI 기술을 활용하여 즉각적인 정보 제공으로 사용자 경험 개선
- 웹 검색을 통한 최신 정보 기반 답변으로 정확도 향상

### 1.3 Related Documents

- API 문서: `/backend/README.md`
- 기존 댓글 시스템: `/backend/routes/comments.js`

---

## 2. Scope

### 2.1 In Scope

- [x] 게시글 작성 후 AI 자동 답변 생성
- [x] Google Gemini API를 통한 자연어 처리
- [x] Tavily Search API를 통한 웹 검색
- [x] 검색 결과 기반 답변 생성
- [x] 댓글로 AI 답변 자동 등록 (작성자: "AI")
- [x] Backend API 엔드포인트 구현
- [x] 환경 변수 설정 (API 키 관리)
- [x] 에러 처리 및 로깅

### 2.2 Out of Scope

- 사용자가 수동으로 AI 답변 요청하는 버튼 (v2에서 추가 가능)
- AI 답변 평가/피드백 기능
- 다국어 답변 생성
- AI 답변 수정/삭제 기능

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 게시글 작성 시 AI 자동 답변 트리거 | High | Pending |
| FR-02 | Google Gemini API로 게시글 내용 분석 | High | Pending |
| FR-03 | Tavily Search API로 웹 검색 수행 | High | Pending |
| FR-04 | 검색 결과를 바탕으로 답변 생성 | High | Pending |
| FR-05 | AI 답변을 댓글로 자동 등록 (author: "AI") | High | Pending |
| FR-06 | API 응답 시간 관리 (비동기 처리) | Medium | Pending |
| FR-07 | AI 답변 생성 실패 시 에러 처리 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | AI 답변 생성 시간 < 10초 | 로그 타임스탬프 분석 |
| Security | API 키 환경 변수로 관리 | .env 파일 검증 |
| Reliability | AI 답변 생성 성공률 > 95% | 로그 분석 |
| Scalability | 동시 요청 처리 가능 | 부하 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] 게시글 작성 시 AI 답변이 자동 생성됨
- [x] AI 답변이 댓글로 정상 등록됨
- [x] API 키가 환경 변수로 안전하게 관리됨
- [x] 에러 발생 시 적절한 로그 및 처리

### 4.2 Quality Criteria

- [x] 코드 리뷰 완료
- [x] API 테스트 완료
- [x] 환경 변수 문서화 완료

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API 키 노출 | High | Medium | .env 파일로 관리, .gitignore 추가 |
| API 호출 실패 | Medium | Medium | Try-catch, 재시도 로직, 에러 로깅 |
| 느린 응답 시간 | Medium | Medium | 비동기 처리, 타임아웃 설정 |
| API 비용 초과 | High | Low | 일일 호출 제한 설정, 모니터링 |
| 부적절한 답변 생성 | Medium | Low | 답변 검증 로직, 필터링 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

**Rationale**: 현재 프로젝트는 Backend + Frontend 구조로 Dynamic 레벨이 적합합니다. AI 서비스와 검색 서비스를 별도 모듈로 분리하여 관리합니다.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| AI API | OpenAI GPT-4 / Claude / Gemini | **Google Gemini** | 무료 티어 제공, 빠른 응답 속도 |
| Search API | Tavily / Google Custom / SerpAPI | **Tavily Search** | AI 친화적, 무료 티어, 빠름 |
| 답변 형태 | 댓글 / 별도 게시글 | **댓글** | 사용자 UX 향상, 기존 시스템 활용 |
| 트리거 시점 | 자동 / 수동 버튼 / 특정 카테고리 | **자동 (모든 게시글)** | 즉각적인 답변 제공 |
| 비동기 처리 | 동기 / 비동기 | **비동기** | 응답 시간 단축, 서버 부하 감소 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

Folder Structure:
backend/
├── routes/
│   ├── posts.js          (기존)
│   ├── comments.js       (기존)
│   └── ai-response.js    (신규 - AI 답변 엔드포인트)
├── services/
│   ├── gemini.service.js (신규 - Google Gemini API)
│   └── tavily.service.js (신규 - Tavily Search API)
├── utils/
│   ├── logger.js         (신규 - AI 답변 로깅)
│   └── validator.js      (기존)
└── .env                   (환경 변수)

Flow:
┌────────────────────────────────────────────────┐
│ 1. POST /api/posts (게시글 작성)                │
│    ↓                                           │
│ 2. AI Response Trigger (비동기)                │
│    ↓                                           │
│ 3. Gemini API: 게시글 분석                     │
│    ↓                                           │
│ 4. Tavily API: 웹 검색                         │
│    ↓                                           │
│ 5. Gemini API: 검색 결과 기반 답변 생성        │
│    ↓                                           │
│ 6. POST /api/comments (AI 답변 댓글 등록)      │
└────────────────────────────────────────────────┘
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

Check which conventions already exist in the project:

- [x] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] `CONVENTIONS.md` exists at project root
- [x] ESLint configuration (`.eslintrc.*`)
- [x] Prettier configuration (`.prettierrc`)
- [ ] TypeScript configuration (`tsconfig.json`) - JS 프로젝트

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | exists (ESLint) | Service 파일 명명 규칙 | High |
| **Folder structure** | exists | services/ 폴더 추가 | High |
| **Import order** | exists (Prettier) | - | Low |
| **Environment variables** | missing | API 키 명명 규칙 | High |
| **Error handling** | exists | AI 서비스 에러 패턴 | High |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `GEMINI_API_KEY` | Google Gemini API 키 | Server | ☑ |
| `TAVILY_API_KEY` | Tavily Search API 키 | Server | ☑ |
| `AI_RESPONSE_ENABLED` | AI 답변 기능 활성화 플래그 | Server | ☑ |
| `AI_RESPONSE_TIMEOUT` | AI 답변 생성 타임아웃 (ms) | Server | ☑ |

### 7.4 Pipeline Integration

현재 프로젝트는 9-phase Pipeline을 사용하지 않으므로 Skip.

---

## 8. Implementation Plan

### 8.1 Phase 1: Backend API Setup

1. **환경 변수 설정**
   - `.env.example` 업데이트
   - `.env` 파일에 API 키 추가

2. **Service Layer 구현**
   - `services/gemini.service.js` 생성
   - `services/tavily.service.js` 생성

3. **AI Response Logic**
   - 게시글 분석 함수
   - 웹 검색 함수
   - 답변 생성 함수

### 8.2 Phase 2: Integration

1. **Post 생성 후 Hook**
   - `/routes/posts.js` 수정
   - AI 답변 비동기 트리거 추가

2. **Comment 자동 생성**
   - AI 답변을 댓글로 등록
   - author: "AI" 설정

### 8.3 Phase 3: Testing & Documentation

1. **API 테스트**
   - 게시글 작성 → AI 답변 생성 확인
   - 에러 시나리오 테스트

2. **문서화**
   - README 업데이트
   - API 문서 업데이트

---

## 9. Next Steps

1. [x] Plan 문서 작성 완료
2. [ ] Design 문서 작성 (`/pdca design ai-auto-response`)
3. [ ] API 키 발급 (Gemini, Tavily)
4. [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-10 | Initial draft | Claude AI |
