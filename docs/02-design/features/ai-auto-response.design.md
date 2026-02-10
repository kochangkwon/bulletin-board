# AI 자동 답변 기능 Design Document

> **Summary**: 게시글 작성 시 AI가 웹 검색을 통해 정확한 답변을 댓글로 자동 생성하는 기능의 상세 설계
>
> **Project**: Bulletin Board
> **Version**: 1.0.0
> **Author**: Claude AI
> **Date**: 2026-02-10
> **Status**: Draft
> **Planning Doc**: [ai-auto-response.plan.md](../../01-plan/features/ai-auto-response.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **비동기 처리**: 게시글 생성 응답 시간에 영향을 주지 않도록 AI 답변 생성은 비동기로 처리
2. **확장성**: AI 서비스와 검색 서비스를 독립적인 모듈로 분리하여 교체 가능하도록 설계
3. **안정성**: API 호출 실패 시에도 게시글 생성은 정상 동작하도록 에러 처리
4. **보안**: API 키는 환경 변수로 관리하고 로그에 노출되지 않도록 마스킹 처리

### 1.2 Design Principles

- **Single Responsibility**: 각 서비스는 단일 책임만 가짐 (Gemini=AI, Tavily=검색)
- **Dependency Injection**: 서비스 간 느슨한 결합으로 테스트 용이성 확보
- **Fail-Safe**: AI 답변 생성 실패 시에도 시스템은 정상 동작
- **Observable**: 모든 AI 작업은 로그로 추적 가능

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────┐      ┌─────────────────────────────────┐
│   Client     │      │         Backend Server          │
│  (Browser)   │      │                                 │
│              │      │  ┌──────────────────────────┐   │
│              │      │  │  Post Controller         │   │
│              │◀────▶│  │  - createPost()          │   │
│              │      │  └──────────┬───────────────┘   │
│              │      │             │                   │
│              │      │             ▼                   │
│              │      │  ┌──────────────────────────┐   │
│              │      │  │  AI Response Service     │   │
│              │      │  │  - generateResponse()    │   │
│              │      │  └──────────┬───────────────┘   │
│              │      │             │                   │
│              │      │    ┌────────┴────────┐          │
│              │      │    ▼                 ▼          │
│              │      │  ┌──────────┐  ┌──────────┐    │
│              │      │  │ Gemini   │  │ Tavily   │    │
│              │      │  │ Service  │  │ Service  │    │
│              │      │  └──────────┘  └──────────┘    │
│              │      │             │                   │
│              │      │             ▼                   │
│              │      │  ┌──────────────────────────┐   │
│              │      │  │  Comment Model           │   │
│              │      │  │  - create()              │   │
│              │      │  └──────────────────────────┘   │
│              │      │             │                   │
│              │      │             ▼                   │
│              │      │  ┌──────────────────────────┐   │
│              │      │  │  SQLite Database         │   │
│              │      │  │  - comments table        │   │
│              │      │  └──────────────────────────┘   │
└──────────────┘      └─────────────────────────────────┘
```

### 2.2 Data Flow

```
1. 사용자가 게시글 작성 (POST /api/posts)
   ↓
2. postController.createPost() 실행
   ↓
3. Post 생성 후 즉시 응답 (201 Created)
   ↓
4. [비동기] aiResponseService.generateResponse(post) 호출
   ↓
5. geminiService.analyzePost(post) - 게시글 분석
   ↓
6. tavilyService.search(query) - 웹 검색
   ↓
7. geminiService.generateAnswer(post, searchResults) - 답변 생성
   ↓
8. Comment.create({ author: "AI", content: answer })
   ↓
9. 로그 기록 및 완료
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| AI Response Service | Gemini Service, Tavily Service, Comment Model | AI 답변 생성 오케스트레이션 |
| Gemini Service | @google/generative-ai | Google Gemini API 호출 |
| Tavily Service | tavily | Tavily Search API 호출 |
| Post Controller | AI Response Service | 게시글 생성 후 AI 답변 트리거 |

---

## 3. Data Model

### 3.1 Entity Definition

기존 Comment 테이블 구조를 그대로 사용합니다.

```javascript
// Comment Entity (기존)
interface Comment {
  id: number;              // Auto-increment ID
  post_id: number;         // 게시글 ID (FK)
  content: string;         // 댓글 내용
  author: string;          // 작성자 (AI 답변의 경우 "AI")
  parent_id: number | null; // 대댓글 ID (AI는 null)
  created_at: string;      // 생성 시간 (DATETIME)
}
```

### 3.2 Entity Relationships

```
[Post] 1 ──── N [Comment]
                  │
                  └── author = "AI" (AI 답변)
```

### 3.3 Database Schema

기존 테이블 구조를 사용하므로 변경 없음.

```sql
-- 기존 comments 테이블 (변경 없음)
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  parent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);
```

**AI 답변 식별 규칙**:
- `author = "AI"`: AI가 생성한 댓글
- `parent_id = NULL`: 게시글에 대한 직접 댓글 (대댓글 아님)

---

## 4. API Specification

### 4.1 Endpoint List

기존 API는 변경 없이 사용합니다. AI 답변은 내부적으로 자동 생성됩니다.

| Method | Path | Description | Changes |
|--------|------|-------------|---------|
| POST | /api/posts | 게시글 생성 | **✅ AI 답변 비동기 트리거 추가** |
| GET | /api/posts/:postId/comments | 댓글 조회 | 변경 없음 (AI 댓글도 포함) |
| POST | /api/posts/:postId/comments | 댓글 생성 | 변경 없음 |

### 4.2 Detailed Specification

#### `POST /api/posts` (수정)

**Request:**
```json
{
  "title": "AI란 무엇인가요?",
  "content": "인공지능에 대해 자세히 알고 싶습니다.",
  "author": "사용자1"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "게시글이 생성되었습니다",
  "data": {
    "id": 123,
    "title": "AI란 무엇인가요?",
    "content": "인공지능에 대해 자세히 알고 싶습니다.",
    "author": "사용자1",
    "created_at": "2026-02-10T10:30:00.000Z",
    "updated_at": "2026-02-10T10:30:00.000Z"
  }
}
```

**Backend Flow:**
```javascript
// 1. 게시글 생성
const post = Post.create(req.body);

// 2. 즉시 응답
res.status(201).json({ success: true, data: post });

// 3. [비동기] AI 답변 생성 (응답 후 실행)
// 사용자는 이미 응답을 받았으므로 대기하지 않음
setImmediate(async () => {
  try {
    await aiResponseService.generateResponse(post);
  } catch (error) {
    // 에러 로깅만 수행, 사용자에게 영향 없음
    logger.error('AI 답변 생성 실패', error);
  }
});
```

#### `GET /api/posts/:postId/comments` (변경 없음)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "post_id": 123,
      "content": "AI(인공지능)는 인간의 학습, 추론, 지각 등의 지능을 컴퓨터로 구현하는 기술입니다...",
      "author": "AI",  // ✅ AI 답변 식별
      "parent_id": null,
      "created_at": "2026-02-10T10:30:05.000Z"
    },
    {
      "id": 2,
      "content": "좋은 설명 감사합니다!",
      "author": "사용자2",
      "parent_id": 1,
      "created_at": "2026-02-10T10:35:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request`: 입력 검증 실패
- `500 Internal Server Error`: 서버 에러 (AI 답변 생성 실패는 포함하지 않음)

---

## 5. Service Layer Design

### 5.1 AI Response Service

**파일**: `src/services/aiResponseService.js`

```javascript
class AIResponseService {
  constructor(geminiService, tavilyService, commentModel) {
    this.geminiService = geminiService;
    this.tavilyService = tavilyService;
    this.commentModel = commentModel;
  }

  /**
   * 게시글에 대한 AI 답변 생성 (메인 오케스트레이션)
   */
  async generateResponse(post) {
    try {
      // 1. 게시글 분석 및 검색 쿼리 추출
      const searchQuery = await this.geminiService.analyzePost(post);

      // 2. 웹 검색
      const searchResults = await this.tavilyService.search(searchQuery);

      // 3. 검색 결과 기반 답변 생성
      const answer = await this.geminiService.generateAnswer(post, searchResults);

      // 4. 댓글로 등록
      const comment = this.commentModel.create({
        post_id: post.id,
        content: answer,
        author: 'AI',
        parent_id: null
      });

      logger.info(`AI 답변 생성 완료 [Post ${post.id}]`);
      return comment;

    } catch (error) {
      logger.error(`AI 답변 생성 실패 [Post ${post.id}]`, error);
      throw error;
    }
  }
}
```

### 5.2 Gemini Service

**파일**: `src/services/geminiService.js`

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(apiKey) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * 게시글 분석 및 검색 쿼리 추출
   */
  async analyzePost(post) {
    const prompt = `
다음 게시글의 핵심 질문이나 주제를 파악하고,
웹 검색에 사용할 최적의 검색 쿼리를 생성해주세요.

제목: ${post.title}
내용: ${post.content}

검색 쿼리만 간단히 출력해주세요 (30자 이내).
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text().trim();
  }

  /**
   * 검색 결과 기반 답변 생성
   */
  async generateAnswer(post, searchResults) {
    const prompt = `
다음 게시글에 대해 웹 검색 결과를 참고하여 정확하고 도움이 되는 답변을 작성해주세요.

게시글 제목: ${post.title}
게시글 내용: ${post.content}

웹 검색 결과:
${searchResults.map((r, i) => `${i+1}. ${r.title}\n   ${r.content}\n   출처: ${r.url}`).join('\n\n')}

요구사항:
- 검색 결과를 바탕으로 정확한 정보 제공
- 200~400자 내외로 작성
- 친절하고 이해하기 쉬운 설명
- 필요시 출처 링크 포함

답변:
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text().trim();
  }
}
```

### 5.3 Tavily Service

**파일**: `src/services/tavilyService.js`

```javascript
const { tavily } = require('@tavily/core');

class TavilyService {
  constructor(apiKey) {
    this.client = tavily({ apiKey });
  }

  /**
   * 웹 검색 수행
   */
  async search(query) {
    const response = await this.client.search(query, {
      search_depth: 'basic',
      max_results: 3,
      include_answer: false,
      include_raw_content: false
    });

    return response.results.map(result => ({
      title: result.title,
      content: result.content,
      url: result.url,
      score: result.score
    }));
  }
}
```

---

## 6. Error Handling

### 6.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| AI_001 | Gemini API 호출 실패 | API 키 오류, 네트워크 오류 | 로그 기록, 재시도 (최대 2회) |
| AI_002 | Tavily API 호출 실패 | API 키 오류, 할당량 초과 | 로그 기록, 검색 없이 답변 생성 시도 |
| AI_003 | 답변 생성 타임아웃 | 응답 시간 > 10초 | 로그 기록, 작업 중단 |
| AI_004 | 댓글 등록 실패 | DB 오류 | 로그 기록, 재시도 (최대 1회) |

### 6.2 Error Response Format

**중요**: AI 답변 생성 에러는 사용자에게 노출되지 않습니다.
- 게시글 생성은 정상 완료
- AI 답변 생성은 백그라운드에서 실패 처리
- 로그에만 에러 기록

```javascript
// 내부 에러 로그 포맷
{
  "timestamp": "2026-02-10T10:30:05.123Z",
  "level": "error",
  "code": "AI_001",
  "message": "Gemini API 호출 실패",
  "details": {
    "postId": 123,
    "error": "API key not valid",
    "retryCount": 2
  }
}
```

---

## 7. Security Considerations

- [x] **API 키 보호**: 환경 변수로 관리, .env 파일은 .gitignore에 추가
- [x] **로그 마스킹**: API 키는 로그에 `***MASKED***`로 출력
- [x] **Rate Limiting**: AI 답변 생성은 게시글 생성과 1:1이므로 별도 제한 불필요
- [x] **입력 검증**: 게시글 내용은 기존 validator로 검증됨
- [x] **SQL Injection 방지**: prepared statement 사용 (기존 구조 유지)
- [x] **XSS 방지**: AI 답변 내용도 클라이언트에서 sanitize 처리 필요 (frontend)

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Unit Test | Gemini Service, Tavily Service | Jest |
| Integration Test | AI Response Service | Jest + Mock |
| E2E Test | 게시글 작성 → AI 댓글 생성 | Manual/Postman |

### 8.2 Test Cases (Key)

#### Unit Tests

- [x] **geminiService.analyzePost()**: 유효한 검색 쿼리 반환
- [x] **geminiService.generateAnswer()**: 유효한 답변 생성
- [x] **tavilyService.search()**: 검색 결과 반환
- [x] **Error handling**: API 키 오류 시 적절한 에러 throw

#### Integration Tests

- [x] **Happy path**: 게시글 생성 → AI 답변 댓글 자동 생성
- [x] **Gemini API 실패**: 재시도 후 에러 로깅
- [x] **Tavily API 실패**: 검색 없이 답변 생성 시도
- [x] **Timeout**: 10초 초과 시 작업 중단

#### E2E Tests

- [x] 게시글 작성 후 5초 이내 AI 댓글 생성 확인
- [x] AI 댓글의 `author`가 "AI"인지 확인
- [x] 여러 게시글 동시 작성 시 모두 AI 답변 생성

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | HTTP 요청/응답 처리 | `src/routes/`, `src/controllers/` |
| **Application** | 비즈니스 로직 오케스트레이션 | `src/services/` |
| **Domain** | 엔티티, 타입 정의 | `src/models/`, `src/types/` |
| **Infrastructure** | 외부 API, DB 접근 | `src/lib/`, `src/config/` |

### 9.2 Dependency Rules

```
┌─────────────────────────────────────────────────┐
│                 Dependency Flow                  │
├─────────────────────────────────────────────────┤
│                                                 │
│   Controller ──→ Service ──→ Model              │
│       │              │          │               │
│       │              ▼          ▼               │
│       │        External APIs  Database          │
│       │                                         │
│       └──→ Middleware                           │
│                                                 │
│   Rule: 상위 레이어는 하위 레이어만 의존        │
│         Infrastructure는 독립적으로 교체 가능   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 9.3 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| postController.createPost | Presentation | `src/controllers/postController.js` |
| aiResponseService | Application | `src/services/aiResponseService.js` |
| geminiService | Infrastructure | `src/services/geminiService.js` |
| tavilyService | Infrastructure | `src/services/tavilyService.js` |
| Comment Model | Domain | `src/models/Comment.js` |
| Logger | Infrastructure | `src/utils/logger.js` |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Service Classes | PascalCase + Service | `GeminiService`, `AIResponseService` |
| Functions | camelCase | `generateResponse()`, `analyzePost()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `AI_TIMEOUT` |
| Files (service) | camelCase.js | `geminiService.js`, `tavilyService.js` |
| Folders | kebab-case | `src/services/`, `src/utils/` |

### 10.2 Environment Variables

| Variable | Purpose | Scope | Example Value |
|----------|---------|-------|---------------|
| `GEMINI_API_KEY` | Google Gemini API 키 | Server only | `AIza...` |
| `TAVILY_API_KEY` | Tavily Search API 키 | Server only | `tvly-...` |
| `AI_RESPONSE_ENABLED` | AI 답변 기능 활성화 | Server only | `true` |
| `AI_RESPONSE_TIMEOUT` | 답변 생성 타임아웃 (ms) | Server only | `10000` |
| `AI_MAX_RETRY` | API 재시도 횟수 | Server only | `2` |

### 10.3 Error Handling Pattern

```javascript
// AI 서비스 에러 처리 패턴
try {
  const result = await externalAPICall();
  return result;
} catch (error) {
  // 1. 에러 로깅 (상세 정보 포함)
  logger.error('AI 작업 실패', {
    code: 'AI_001',
    postId: post.id,
    error: error.message,
    stack: error.stack
  });

  // 2. 재시도 로직 (필요시)
  if (retryCount < MAX_RETRY) {
    return await retry();
  }

  // 3. 에러 전파 (상위에서 catch)
  throw new AIServiceError('AI 답변 생성 실패', error);
}
```

---

## 11. Implementation Guide

### 11.1 File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── aiResponseService.js    (신규)
│   │   ├── geminiService.js        (신규)
│   │   └── tavilyService.js        (신규)
│   ├── utils/
│   │   └── logger.js               (신규)
│   ├── controllers/
│   │   └── postController.js       (수정)
│   └── models/
│       └── Comment.js              (기존)
├── .env                             (수정)
├── .env.example                     (수정)
└── package.json                     (수정 - 의존성 추가)
```

### 11.2 Implementation Order

#### Phase 1: 환경 설정 (30분)
1. [x] `.env.example` 업데이트
2. [x] `.env`에 API 키 추가
3. [x] `package.json`에 의존성 추가
   ```json
   {
     "dependencies": {
       "@google/generative-ai": "^0.2.0",
       "@tavily/core": "^1.1.0"
     }
   }
   ```
4. [x] `npm install` 실행

#### Phase 2: Service Layer 구현 (2시간)
1. [x] `src/utils/logger.js` 생성
2. [x] `src/services/geminiService.js` 구현
3. [x] `src/services/tavilyService.js` 구현
4. [x] `src/services/aiResponseService.js` 구현
5. [x] Unit test 작성 및 실행

#### Phase 3: Controller 통합 (1시간)
1. [x] `src/controllers/postController.js` 수정
   - `createPost()` 함수에 AI 답변 트리거 추가
2. [x] 에러 처리 추가
3. [x] Integration test 작성

#### Phase 4: 테스트 및 검증 (1시간)
1. [x] 수동 테스트 (Postman)
   - 게시글 작성
   - AI 댓글 생성 확인
   - 에러 시나리오 테스트
2. [x] 로그 확인
3. [x] 성능 측정 (답변 생성 시간)

#### Phase 5: 문서화 (30분)
1. [x] README.md 업데이트
2. [x] API 문서 업데이트 (Swagger)
3. [x] .env.example 주석 추가

---

## 12. Configuration

### 12.1 Environment Variables (.env.example)

```bash
# AI 답변 기능 설정
AI_RESPONSE_ENABLED=true
AI_RESPONSE_TIMEOUT=10000
AI_MAX_RETRY=2

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Tavily Search API
TAVILY_API_KEY=your_tavily_api_key_here
```

### 12.2 Logger Configuration

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/ai-response.log',
      level: 'info'
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    })
  ]
});

// 개발 환경에서는 콘솔 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

## 13. Performance Considerations

### 13.1 Response Time Goals

| Operation | Target Time | Measurement |
|-----------|-------------|-------------|
| 게시글 생성 응답 | < 500ms | 변경 없음 (AI는 비동기) |
| AI 답변 생성 (전체) | < 10초 | 타임아웃 설정 |
| - Gemini analyzePost | < 2초 | |
| - Tavily search | < 3초 | |
| - Gemini generateAnswer | < 4초 | |
| - Comment 등록 | < 100ms | |

### 13.2 Optimization Strategies

1. **비동기 처리**: `setImmediate()` 사용으로 응답 시간 영향 없음
2. **병렬 처리 (향후)**: 여러 게시글의 AI 답변을 동시에 처리 가능
3. **캐싱 (향후)**: 유사한 질문에 대한 답변 캐싱 고려
4. **Rate Limiting**: Gemini/Tavily API 호출 제한 준수

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-10 | Initial design draft | Claude AI |
