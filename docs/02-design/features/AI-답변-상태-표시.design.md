# AI 답변 상태 표시 기능 Design Document

> **Summary**: 게시글 목록에서 AI 답변 여부를 아이콘으로 시각적으로 표시하는 기능의 상세 설계
>
> **Project**: Bulletin Board
> **Version**: 1.0.0
> **Author**: Claude AI
> **Date**: 2026-02-11
> **Status**: Draft
> **Planning Doc**: [AI-답변-상태-표시.plan.md](../../01-plan/features/AI-답변-상태-표시.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **성능 최적화**: 단일 쿼리로 AI 답변 여부를 확인하여 API 응답 시간 최소화
2. **직관적인 UI**: 사용자가 한눈에 AI 답변 여부를 파악할 수 있는 명확한 아이콘
3. **유지보수성**: 기존 코드 구조를 최소한으로 변경하여 안정성 유지
4. **확장성**: 향후 AI 답변 개수 표시 등 추가 기능 확장 가능

### 1.2 Design Principles

- **Minimal Changes**: 기존 API 구조를 유지하면서 필드만 추가
- **Type Safety**: TypeScript로 타입 안정성 보장
- **Responsive Design**: 모바일/데스크톱 모든 화면에서 정상 표시
- **Accessibility**: 아이콘에 적절한 aria-label 제공

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Frontend                          │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         BoardList Component                │    │
│  │                                            │    │
│  │  ┌──────────────────────────────────┐     │    │
│  │  │  Post Row                        │     │    │
│  │  │  - No                            │     │    │
│  │  │  - Title + AI Icon (conditional) │     │    │
│  │  │  - Author                        │     │    │
│  │  │  - Date                          │     │    │
│  │  └──────────────────────────────────┘     │    │
│  └────────────────────────────────────────────┘    │
│                      ▲                              │
│                      │ GET /api/posts               │
│                      │ { has_ai_response: boolean } │
└──────────────────────┼──────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│                    Backend                          │
│                      ▼                              │
│  ┌────────────────────────────────────────────┐    │
│  │         Post Controller                    │    │
│  │         - getAllPosts()                    │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                │
│                   ▼                                │
│  ┌────────────────────────────────────────────┐    │
│  │         Post Model                         │    │
│  │         - getAll() [MODIFIED]              │    │
│  │           + LEFT JOIN comments             │    │
│  │           + has_ai_response field          │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                │
│                   ▼                                │
│  ┌────────────────────────────────────────────┐    │
│  │         SQLite Database                    │    │
│  │                                            │    │
│  │  posts table        comments table         │    │
│  │  - id               - id                   │    │
│  │  - title            - post_id              │    │
│  │  - content          - author ('AI')        │    │
│  │  - author           - content              │    │
│  │  - created_at       - created_at           │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. 사용자가 게시글 목록 접근
   ↓
2. GET /api/posts?page=1&limit=10
   ↓
3. Post.getAll() 실행
   ├─ SELECT posts.*,
   │    CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as has_ai_response
   │  FROM posts p
   │  LEFT JOIN comments c ON p.id = c.post_id AND c.author = 'AI'
   │  GROUP BY p.id
   ↓
4. API 응답
   {
     "posts": [
       {
         "id": 1,
         "title": "질문입니다",
         "has_ai_response": 1  // ← 추가된 필드
       }
     ]
   }
   ↓
5. BoardList 컴포넌트 렌더링
   ├─ post.has_ai_response === 1 이면
   │  └─ <Bot className="..." /> 아이콘 표시
   └─ 그렇지 않으면 아이콘 미표시
```

---

## 3. Database Schema

### 3.1 Existing Schema (변경 없음)

기존 테이블 구조는 유지하며, 쿼리만 수정합니다.

```sql
-- posts 테이블 (기존)
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- comments 테이블 (기존)
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,  -- 'AI' 값으로 AI 답변 구분
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
```

### 3.2 Query Modification

```sql
-- 기존 쿼리 (AI 답변 여부 없음)
SELECT id, title, content, author, created_at, updated_at
FROM posts
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- 수정된 쿼리 (AI 답변 여부 포함)
SELECT
  p.id,
  p.title,
  p.content,
  p.author,
  p.created_at,
  p.updated_at,
  CASE
    WHEN c.id IS NOT NULL THEN 1
    ELSE 0
  END as has_ai_response
FROM posts p
LEFT JOIN comments c
  ON p.id = c.post_id
  AND c.author = 'AI'
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 10 OFFSET 0;
```

**설명**:
- `LEFT JOIN`으로 AI 댓글 존재 여부 확인
- `c.author = 'AI'` 조건으로 AI 댓글만 필터링
- `CASE WHEN`으로 boolean 값 (1/0) 반환
- `GROUP BY p.id`로 중복 제거 (AI 댓글이 여러 개인 경우)

---

## 4. API Specification

### 4.1 GET /api/posts (수정)

게시글 목록 조회 API에 `has_ai_response` 필드를 추가합니다.

#### Request

```http
GET /api/posts?page=1&limit=10&search=
```

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | 페이지 번호 |
| limit | number | No | 10 | 페이지당 게시글 수 |
| search | string | No | "" | 검색어 |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "JavaScript 질문입니다",
      "content": "...",
      "author": "user1",
      "created_at": "2026-02-11T07:00:00.000Z",
      "updated_at": "2026-02-11T07:00:00.000Z",
      "has_ai_response": 1  // ← 추가된 필드 (1: AI 답변 있음, 0: 없음)
    },
    {
      "id": 2,
      "title": "안녕하세요",
      "content": "...",
      "author": "user2",
      "created_at": "2026-02-11T06:50:00.000Z",
      "updated_at": "2026-02-11T06:50:00.000Z",
      "has_ai_response": 0  // ← AI 답변 없음
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Response Field Changes

| Field | Type | Added | Description |
|-------|------|-------|-------------|
| `has_ai_response` | number | ✅ | AI 답변 여부 (1: 있음, 0: 없음) |

---

## 5. Type Definitions

### 5.1 TypeScript Interfaces

#### frontend/src/types/common.types.ts

```typescript
// 기존 Post 인터페이스 수정
export interface Post {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  has_ai_response?: number  // ← 추가 (optional, 0 or 1)
}

// 다른 타입들은 변경 없음
export interface Comment {
  id: number
  post_id: number
  parent_id?: number | null
  content: string
  author: string
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: ValidationError[]
  pagination?: PaginationResult
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  totalPages: number
}
```

### 5.2 Backend Type Safety

Backend는 JavaScript이므로 JSDoc으로 타입 정의:

```javascript
/**
 * @typedef {Object} PostWithAIResponse
 * @property {number} id - 게시글 ID
 * @property {string} title - 제목
 * @property {string} content - 내용
 * @property {string} author - 작성자
 * @property {string} created_at - 생성일시
 * @property {string} updated_at - 수정일시
 * @property {number} has_ai_response - AI 답변 여부 (0 or 1)
 */
```

---

## 6. UI/UX Design

### 6.1 Icon Selection

**선택된 아이콘**: `Bot` (lucide-react)

**대안**: `Sparkles`, `MessageSquare`, `CheckCircle`

**선택 이유**:
- Bot 아이콘은 AI를 직관적으로 표현
- 다른 UI 요소와 겹치지 않는 독특한 모양
- 크기가 작아도 식별 가능

### 6.2 Icon Placement

**위치**: 제목 텍스트 오른쪽

```
┌────────────────────────────────────────────────────────┐
│ No │ 제목                                │ 글쓴이 │ 작성시간 │
├────┼─────────────────────────────────────┼────────┼──────────┤
│ 5  │ JavaScript 질문입니다 🤖           │ user1  │ 02-11    │
│ 4  │ 안녕하세요                         │ user2  │ 02-10    │
│ 3  │ React 관련 질문 🤖                 │ user3  │ 02-09    │
└────┴─────────────────────────────────────┴────────┴──────────┘
```

### 6.3 Styling Specification

```typescript
// BoardList.tsx 내 아이콘 스타일
<Bot
  className="h-4 w-4 text-blue-500 inline-block ml-2"
  aria-label="AI 답변 있음"
/>
```

**스타일 상세**:
- `h-4 w-4`: 16px × 16px (작은 크기)
- `text-blue-500`: Primary 컬러 (파란색)
- `inline-block`: 텍스트 흐름에 맞춰 배치
- `ml-2`: 제목과 8px 간격
- `aria-label`: 접근성을 위한 레이블

### 6.4 Hover Effect (Optional)

```typescript
// 추가 가능한 hover 효과
<Bot
  className="h-4 w-4 text-blue-500 inline-block ml-2 hover:text-blue-700 transition-colors"
  title="AI 답변 있음"
  aria-label="AI 답변 있음"
/>
```

---

## 7. Implementation Details

### 7.1 Backend Implementation

#### File: `backend/src/models/Post.js`

**변경 사항**: `getAll()` 메서드 수정

```javascript
// 기존 코드
static getAll(page = 1, limit = 10, search = '') {
  const offset = (page - 1) * limit;

  let query = `
    SELECT id, title, content, author, created_at, updated_at
    FROM posts
  `;
  // ... 나머지 코드
}
```

**수정된 코드**:

```javascript
static getAll(page = 1, limit = 10, search = '') {
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      p.id,
      p.title,
      p.content,
      p.author,
      p.created_at,
      p.updated_at,
      CASE
        WHEN c.id IS NOT NULL THEN 1
        ELSE 0
      END as has_ai_response
    FROM posts p
    LEFT JOIN comments c
      ON p.id = c.post_id
      AND c.author = 'AI'
  `;

  let countQuery = 'SELECT COUNT(DISTINCT p.id) as count FROM posts p';
  const params = [];
  const countParams = [];

  // 검색어가 있는 경우 WHERE 절 추가
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    query += ` WHERE p.title LIKE ? OR p.content LIKE ? OR p.author LIKE ?`;
    countQuery += ` WHERE p.title LIKE ? OR p.content LIKE ? OR p.author LIKE ?`;
    params.push(searchTerm, searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const posts = db.prepare(query).all(...params);
  const total = db.prepare(countQuery).get(...countParams);

  return {
    posts,
    pagination: {
      page,
      limit,
      total: total.count,
      totalPages: Math.ceil(total.count / limit)
    }
  };
}
```

**변경 포인트**:
1. `SELECT`에 `has_ai_response` 계산 필드 추가
2. `LEFT JOIN comments`로 AI 댓글 확인
3. `GROUP BY p.id`로 중복 제거
4. `countQuery`에 `DISTINCT` 추가

### 7.2 Frontend Implementation

#### File: `frontend/src/types/common.types.ts`

```typescript
// Post 인터페이스에 has_ai_response 추가
export interface Post {
  id: number
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
  has_ai_response?: number  // ← 추가
}
```

#### File: `frontend/src/components/BoardList.tsx`

**Import 추가**:

```typescript
import { Bot } from 'lucide-react'
```

**제목 렌더링 수정** (line ~159-165):

```typescript
// 기존 코드
<TableCell>
  <div className="flex items-center gap-1.5">
    <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
    <span className="text-sm text-gray-900 hover:underline">
      {post.title}
    </span>
  </div>
</TableCell>
```

**수정된 코드**:

```typescript
<TableCell>
  <div className="flex items-center gap-1.5">
    <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
    <span className="text-sm text-gray-900 hover:underline">
      {post.title}
    </span>
    {post.has_ai_response === 1 && (
      <Bot
        className="h-4 w-4 text-blue-500 inline-block ml-1"
        aria-label="AI 답변 있음"
        title="AI 답변 있음"
      />
    )}
  </div>
</TableCell>
```

**변경 포인트**:
1. `Bot` 아이콘 import
2. 조건부 렌더링: `post.has_ai_response === 1`일 때만 표시
3. 접근성: `aria-label`과 `title` 속성 추가

---

## 8. Testing Strategy

### 8.1 Backend API Testing

#### Test Cases

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| AI 답변 있는 게시글 | POST with AI comment | `has_ai_response: 1` |
| AI 답변 없는 게시글 | POST without AI comment | `has_ai_response: 0` |
| 일반 댓글만 있는 게시글 | POST with user comment | `has_ai_response: 0` |
| 검색 시 필터링 | Search query with AI posts | Correct filtering with `has_ai_response` |
| 페이지네이션 | page=2, limit=10 | Correct pagination with `has_ai_response` |

#### Manual Testing

```bash
# 1. 게시글 생성
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Content","author":"user1"}'

# 2. AI 댓글 생성 (수동)
curl -X POST http://localhost:3000/api/posts/1/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"AI답변입니다","author":"AI"}'

# 3. 게시글 목록 조회 (has_ai_response 확인)
curl http://localhost:3000/api/posts?page=1&limit=10
```

### 8.2 Frontend UI Testing

#### Visual Testing Checklist

- [ ] AI 답변 있는 게시글에 Bot 아이콘 표시됨
- [ ] AI 답변 없는 게시글에 아이콘 미표시됨
- [ ] 아이콘이 제목과 자연스럽게 배치됨
- [ ] hover 시 툴팁 "AI 답변 있음" 표시됨 (title 속성)
- [ ] 모바일 화면에서도 정상 표시됨
- [ ] 다크모드에서도 아이콘이 잘 보임 (해당 시)

#### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 8.3 Performance Testing

#### Metrics

| Metric | Before | After | Acceptable Range |
|--------|--------|-------|------------------|
| API Response Time | ~50ms | ~70ms | < 100ms |
| Query Execution Time | ~5ms | ~15ms | < 30ms |
| First Contentful Paint | ~200ms | ~210ms | < 250ms |

#### Load Testing

```bash
# Apache Bench로 부하 테스트
ab -n 1000 -c 10 http://localhost:3000/api/posts?page=1&limit=10
```

---

## 9. Error Handling

### 9.1 Backend Error Scenarios

| Error | Cause | Handling |
|-------|-------|----------|
| Query 실패 | DB connection error | 기존 에러 처리 유지, `has_ai_response: 0` 기본값 |
| JOIN 실패 | comments 테이블 없음 | Graceful degradation, 로그 기록 |

### 9.2 Frontend Error Scenarios

| Error | Cause | Handling |
|-------|-------|----------|
| `has_ai_response` 없음 | API 응답 필드 누락 | Optional chaining으로 처리 (아이콘 미표시) |
| 아이콘 import 실패 | lucide-react 미설치 | Build error, npm install 필요 |

---

## 10. Rollback Plan

만약 문제가 발생할 경우 쉽게 롤백 가능합니다.

### 10.1 Backend Rollback

```javascript
// Post.js에서 쿼리를 원래대로 복구
static getAll(page = 1, limit = 10, search = '') {
  let query = `
    SELECT id, title, content, author, created_at, updated_at
    FROM posts
  `;
  // ... (기존 코드)
}
```

### 10.2 Frontend Rollback

```typescript
// BoardList.tsx에서 아이콘 렌더링 제거
<TableCell>
  <div className="flex items-center gap-1.5">
    <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
    <span className="text-sm text-gray-900 hover:underline">
      {post.title}
    </span>
    {/* AI 아이콘 제거 */}
  </div>
</TableCell>
```

---

## 11. Future Enhancements (Out of Scope)

### v2 Features

1. **AI 답변 개수 표시**
   ```
   제목 🤖 (3)  // AI 답변 3개
   ```

2. **AI 답변 미리보기**
   - hover 시 첫 번째 AI 답변 일부를 툴팁으로 표시

3. **필터링 기능**
   - "AI 답변 있는 게시글만 보기" 필터 추가

4. **AI 답변 품질 표시**
   - 사용자 피드백 기반 품질 점수 표시

---

## 12. Implementation Checklist

### Backend
- [ ] `backend/src/models/Post.js` - `getAll()` 쿼리 수정
- [ ] 로컬 테스트: 게시글 생성 → AI 댓글 생성 → API 응답 확인
- [ ] API 문서 업데이트 (`has_ai_response` 필드 설명)

### Frontend
- [ ] `frontend/src/types/common.types.ts` - `Post` 타입 업데이트
- [ ] `frontend/src/components/BoardList.tsx` - Bot 아이콘 추가
- [ ] Bot 아이콘 import 확인 (lucide-react)
- [ ] 조건부 렌더링 로직 구현
- [ ] 접근성 속성 추가 (aria-label, title)
- [ ] 시각적 확인 (dev server 실행)

### Testing
- [ ] Backend API 테스트 (Postman/curl)
- [ ] Frontend UI 테스트 (브라우저)
- [ ] 반응형 테스트 (모바일/데스크톱)
- [ ] 성능 테스트 (API 응답 시간)

### Documentation
- [ ] README 업데이트 (기능 설명)
- [ ] API 문서 업데이트
- [ ] CHANGELOG 업데이트

---

## 13. Dependencies

### 13.1 Existing Dependencies (변경 없음)

| Package | Version | Used In |
|---------|---------|---------|
| lucide-react | ^0.563.0 | Frontend (Bot 아이콘) |
| better-sqlite3 | ^12.6.2 | Backend (DB 쿼리) |

### 13.2 No New Dependencies

이 기능은 기존 패키지만으로 구현 가능하며, 새로운 의존성 추가가 필요하지 않습니다.

---

## 14. Next Steps

1. [ ] Design 문서 리뷰 및 승인
2. [ ] 구현 시작 (`/pdca do AI-답변-상태-표시`)
3. [ ] Backend 구현 (Post.getAll() 수정)
4. [ ] Frontend 구현 (BoardList 아이콘 추가)
5. [ ] 테스트 및 검증
6. [ ] Gap Analysis (`/pdca analyze AI-답변-상태-표시`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-11 | Initial design | Claude AI |
