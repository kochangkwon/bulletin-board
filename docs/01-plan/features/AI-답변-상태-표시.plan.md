# AI 답변 상태 표시 기능 Planning Document

> **Summary**: 게시글 목록에서 AI 답변 여부를 아이콘으로 시각적으로 표시하여 사용자가 한눈에 확인할 수 있도록 하는 기능
>
> **Project**: Bulletin Board
> **Version**: 1.0.0
> **Author**: Claude AI
> **Date**: 2026-02-11
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

게시글 목록(BoardList)에서 AI가 답변한 게시글을 아이콘으로 표시하여, 사용자가 여러 번 클릭하여 확인하지 않고도 AI 답변 여부를 즉시 확인할 수 있도록 합니다.

### 1.2 Background

- 현재 AI가 댓글을 작성해도 게시글 목록에서 답변 여부를 알 수 없음
- 사용자가 각 게시글을 클릭하여 상세 페이지로 이동해야만 AI 답변 확인 가능
- UX 개선을 통해 AI 답변이 있는 게시글을 빠르게 식별할 필요

### 1.3 Related Documents

- 기존 AI 자동 답변 기능: `docs/01-plan/features/ai-auto-response.plan.md`
- Frontend 컴포넌트: `frontend/src/components/BoardList.tsx`
- Backend API: `backend/src/routes/posts.js`
- Backend Model: `backend/src/models/Post.js`

---

## 2. Scope

### 2.1 In Scope

- [ ] 게시글 목록 API에 AI 답변 여부 필드 추가
- [ ] 게시글 조회 시 AI 댓글 존재 여부 확인 로직
- [ ] BoardList 컴포넌트에 AI 답변 아이콘 표시
- [ ] 아이콘 디자인 (lucide-react 사용)
- [ ] 아이콘 색상 및 위치 설정
- [ ] 아이콘 hover 시 툴팁 표시 (선택사항)

### 2.2 Out of Scope

- AI 답변 내용 미리보기
- AI 답변 품질 평가 표시
- AI 답변 개수 표시 (v2에서 추가 가능)
- 다른 사용자 댓글 개수 표시
- 필터링 기능 (AI 답변 있는 게시글만 보기)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 게시글 목록 API에 has_ai_response 필드 추가 | High | Pending |
| FR-02 | Post 모델에 AI 댓글 확인 메서드 추가 | High | Pending |
| FR-03 | BoardList에 AI 답변 아이콘 표시 | High | Pending |
| FR-04 | 아이콘은 제목 옆 또는 작성자 열에 표시 | Medium | Pending |
| FR-05 | 아이콘 hover 시 "AI 답변 있음" 툴팁 표시 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | API 응답 시간 증가 < 50ms | API 성능 테스트 |
| UX | 아이콘이 목록 레이아웃을 해치지 않음 | UI 리뷰 |
| Accessibility | 아이콘의 의미를 스크린 리더가 전달 가능 | aria-label 설정 |
| Consistency | lucide-react의 기존 아이콘 스타일 유지 | 시각적 검증 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 게시글 목록 API 응답에 has_ai_response 필드 포함
- [ ] AI 답변이 있는 게시글에 아이콘 표시
- [ ] 아이콘이 직관적이고 눈에 잘 띔
- [ ] 모바일 화면에서도 정상 표시

### 4.2 Quality Criteria

- [ ] 코드 리뷰 완료
- [ ] API 테스트 완료
- [ ] UI/UX 테스트 완료
- [ ] 타입 정의 완료 (TypeScript)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API 성능 저하 | Medium | Low | 효율적인 쿼리 사용 (LEFT JOIN) |
| 아이콘이 레이아웃 깨뜨림 | Low | Medium | Flexbox 사용, 반응형 테스트 |
| AI 답변 확인 로직 오류 | Medium | Low | 단위 테스트 작성 |
| 다양한 브라우저 호환성 | Low | Low | 최신 React 및 lucide-react 사용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

**Rationale**: 기존 프로젝트가 Dynamic 레벨이므로 동일하게 유지합니다.

### 6.2 Key Design Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| AI 답변 확인 방법 | 1) 별도 API 호출<br>2) posts API에 포함<br>3) 프론트엔드에서 계산 | **2) posts API에 포함** | 성능 최적화, 단일 API 호출 |
| 아이콘 위치 | 1) 제목 앞<br>2) 제목 뒤<br>3) 작성자 열 | **2) 제목 뒤** | 제목 가독성 유지, 자연스러운 배치 |
| 아이콘 종류 | Bot, Sparkles, MessageSquare, CheckCircle | **Bot 또는 Sparkles** | AI를 직관적으로 표현 |
| 아이콘 색상 | Primary, Secondary, Success, Custom | **Primary (blue)** | 기존 디자인 시스템과 일관성 |

### 6.3 Database Query Strategy

```
Option 1: LEFT JOIN (추천)
SELECT
  p.*,
  CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as has_ai_response
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id AND c.author = 'AI'
GROUP BY p.id

Option 2: Subquery
SELECT
  p.*,
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND author = 'AI') as ai_comment_count
FROM posts p

Option 3: Application Logic
- posts API는 그대로 유지
- 프론트엔드에서 각 게시글마다 댓글 API 호출 (비효율적)
```

**Selected**: Option 1 (LEFT JOIN) - 성능과 코드 간결성

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] TypeScript 사용 (Frontend)
- [x] lucide-react 아이콘 라이브러리 사용
- [x] Tailwind CSS 스타일링
- [x] Better-sqlite3 데이터베이스

### 7.2 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Database Field | snake_case | `has_ai_response` |
| TypeScript Interface | PascalCase | `Post`, `PaginationResult` |
| Component Props | camelCase | `hasAiResponse` |
| CSS Class | kebab-case | `ai-response-icon` |

---

## 8. Implementation Plan

### 8.1 Phase 1: Backend API Enhancement

1. **Post 모델 수정**
   - `Post.getAll()` 메서드에 AI 답변 확인 쿼리 추가
   - `has_ai_response` 필드 반환

2. **API 응답 형식 업데이트**
   - 기존 posts 배열에 `has_ai_response: boolean` 추가

3. **테스트**
   - API 응답 확인
   - AI 답변 있는/없는 게시글 테스트

### 8.2 Phase 2: Frontend UI Implementation

1. **TypeScript 타입 정의**
   - `Post` 인터페이스에 `has_ai_response?: boolean` 추가

2. **BoardList 컴포넌트 수정**
   - 아이콘 import (lucide-react)
   - 제목 렌더링 로직에 아이콘 추가
   - 조건부 렌더링 (`hasAiResponse && <Icon />`)

3. **스타일링**
   - 아이콘 크기, 색상, 여백 설정
   - hover 효과 추가 (선택사항)

### 8.3 Phase 3: Testing & Polish

1. **UI/UX 테스트**
   - 데스크톱/모바일 반응형 테스트
   - 다양한 브라우저 테스트

2. **성능 테스트**
   - API 응답 시간 측정
   - 대량 데이터 렌더링 테스트

---

## 9. Implementation Checklist

### Backend
- [ ] `backend/src/models/Post.js` - `getAll()` 쿼리 수정
- [ ] API 응답 테스트 (Postman/Thunder Client)

### Frontend
- [ ] `frontend/src/types/common.types.ts` - `Post` 타입 업데이트
- [ ] `frontend/src/components/BoardList.tsx` - 아이콘 추가
- [ ] 시각적 확인 및 반응형 테스트

### Documentation
- [ ] README 업데이트 (기능 설명)
- [ ] API 문서 업데이트 (has_ai_response 필드 설명)

---

## 10. Next Steps

1. [ ] Plan 문서 리뷰 및 승인
2. [ ] Design 문서 작성 (`/pdca design AI-답변-상태-표시`)
3. [ ] 구현 시작 (`/pdca do AI-답변-상태-표시`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-11 | Initial draft | Claude AI |
