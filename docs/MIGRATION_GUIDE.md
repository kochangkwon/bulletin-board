# Migration Guide: global.mdc 규칙 적용 완료

**작업 일자**: 2026-02-09
**적용 범위**: 데이터베이스(SQLite) 제외, Express + React 아키텍처 유지

---

## 📋 완료된 작업 요약

✅ 7개의 주요 작업 완료:
1. ✅ TypeScript 마이그레이션 설정
2. ✅ 코드 스타일 통일 (세미콜론 제거)
3. ✅ Zod 검증 시스템 도입
4. ✅ Shadcn UI + Tailwind CSS 추가
5. ✅ React Query + Zustand 상태 관리
6. ✅ Vitest + Playwright 테스트 프레임워크
7. ✅ GitHub Actions CI/CD 파이프라인

---

## 🎯 1. TypeScript 마이그레이션

### 완료된 설정

**Backend:**
- ✅ `tsconfig.json` 생성 (strict mode)
- ✅ TypeScript 의존성 설치 (`@types/*`)
- ✅ `src/types/common.types.ts` - 공통 타입 정의
- ✅ `tsx` 개발 서버 설정

**Frontend:**
- ✅ `tsconfig.json` 생성
- ✅ `src/types/common.types.ts` - API 응답 타입
- ✅ Path alias 설정 (`@/*`)

### 사용 방법

```bash
# Backend 타입 체크
cd backend
npm run type-check

# Backend 개발 서버 (TypeScript 지원)
npm run dev

# Build TypeScript
npm run build
```

### 점진적 마이그레이션 가이드

기존 `.js` 파일을 `.ts`로 변환:

```bash
# 예시: postController.js → postController.ts
mv src/controllers/postController.js src/controllers/postController.ts
```

타입 추가 예시:
```typescript
// Before (JavaScript)
exports.getAllPosts = (req, res) => {
  const page = parseInt(req.query.page) || 1
  // ...
}

// After (TypeScript)
import { Request, Response } from 'express'
import { Result } from '@/types/common.types'

export const getAllPosts = (
  req: Request,
  res: Response
): Promise<Result<Post[], string>> => {
  const page = parseInt(req.query.page as string) || 1
  // ...
}
```

---

## 🎨 2. 코드 스타일 (세미콜론 제거)

### 완료된 설정

**Backend:**
- ✅ ESLint 설정 (`eslint.config.js`)
- ✅ Prettier 설정 (`.prettierrc.json`)
- ✅ Lint 스크립트 추가

**Frontend:**
- ✅ ESLint 규칙 업데이트
- ✅ Prettier 설정
- ✅ Lint 스크립트 추가

### 사용 방법

```bash
# Backend
cd backend
npm run lint          # Lint 검사
npm run lint:fix      # 자동 수정
npm run format        # Prettier 포맷팅

# Frontend
cd frontend
npm run lint
npm run lint:fix
npm run format
```

### 코드 스타일 규칙

```javascript
// ✅ 올바른 스타일 (세미콜론 없음)
const express = require('express')
const app = express()

function handleRequest(req, res) {
  return res.json({ success: true })
}

// ❌ 잘못된 스타일 (세미콜론 있음)
const express = require('express');
const app = express();
```

**주의사항:**
- ASI (Automatic Semicolon Insertion) 주의
- `[`, `(`, `` ` `` 로 시작하는 줄에 주의

---

## ✅ 3. Zod 검증 시스템

### 생성된 파일

**Schemas:**
- ✅ `backend/src/schemas/post.schema.ts`
- ✅ `backend/src/schemas/comment.schema.ts`

**Utilities:**
- ✅ `backend/src/lib/env.ts` - 환경 변수 검증
- ✅ `backend/src/middleware/validate.ts` - Zod 미들웨어

### 사용 방법

#### 환경 변수 검증

```typescript
// backend/src/lib/env.ts
import { env } from '@/lib/env'

console.log(env.NODE_ENV)  // Type-safe!
console.log(env.PORT)       // number (자동 변환)
```

#### 라우트에서 Zod 검증 사용

```typescript
// Before (express-validator)
const { body } = require('express-validator')

router.post('/posts', [
  body('title').trim().isLength({ min: 1 }),
], postController.createPost)

// After (Zod)
import { validate } from '@/middleware/validate'
import { createPostSchema } from '@/schemas/post.schema'

router.post('/posts',
  validate(createPostSchema, 'body'),
  postController.createPost
)
```

#### 컨트롤러에서 검증된 데이터 사용

```typescript
import { CreatePostInput } from '@/schemas/post.schema'

export const createPost = (req: Request, res: Response) => {
  // req.body는 이미 검증되고 타입이 지정됨
  const data: CreatePostInput = req.body

  // title, content, author 모두 타입 안전
  const post = Post.create(data)
  // ...
}
```

---

## 🎨 4. Shadcn UI + Tailwind CSS

### 생성된 파일

**설정:**
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`
- ✅ `src/index.css` (Tailwind 지시문)
- ✅ `vite.config.ts` (path alias)

**Components:**
- ✅ `src/components/ui/button.tsx`
- ✅ `src/components/ui/card.tsx`
- ✅ `src/lib/utils.ts` (cn 함수)

### 사용 방법

#### Button 컴포넌트

```tsx
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

<Button variant="default" size="lg">
  <Plus className="mr-2 h-4 w-4" />
  New Post
</Button>

<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

#### Card 컴포넌트

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Post Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Post content here...</p>
  </CardContent>
</Card>
```

#### Tailwind 유틸리티 클래스

```tsx
<div className="flex items-center justify-between p-4 bg-background">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
  <Button>Action</Button>
</div>
```

### 기존 컴포넌트 마이그레이션

**Before (CSS):**
```jsx
// PostList.jsx
<div className="post-item">
  <h3>{post.title}</h3>
</div>

// PostList.css
.post-item {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
}
```

**After (Tailwind + Shadcn):**
```tsx
// PostList.tsx
import { Card, CardTitle } from '@/components/ui/card'

<Card className="p-4">
  <CardTitle>{post.title}</CardTitle>
</Card>
```

---

## 🔄 5. React Query + Zustand

### 생성된 파일

**설정:**
- ✅ `src/lib/query-client.ts` - React Query 설정
- ✅ `src/stores/ui.store.ts` - Zustand UI 상태

**Hooks:**
- ✅ `src/hooks/usePosts.ts` - 서버 상태 관리

### 사용 방법

#### React Query Provider 설정

```tsx
// src/main.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { Toaster } from 'sonner'

root.render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
  </QueryClientProvider>
)
```

#### 데이터 페칭 (React Query)

```tsx
// Before (useState + useEffect)
const [posts, setPosts] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchPosts().then(setPosts)
}, [])

// After (React Query)
import { usePosts } from '@/hooks/usePosts'

const { data, isLoading, error } = usePosts(page, limit)
```

#### 데이터 변경 (Mutation)

```tsx
import { useCreatePost } from '@/hooks/usePosts'

const { mutate: createPost, isPending } = useCreatePost()

const handleSubmit = (formData) => {
  createPost(formData, {
    onSuccess: () => {
      // Toast는 자동으로 표시됨
      // 목록은 자동으로 새로고침됨 (invalidateQueries)
    }
  })
}
```

#### UI 상태 관리 (Zustand)

```tsx
import { useUIStore } from '@/stores/ui.store'

const PostList = () => {
  const { viewPost, createPost } = useUIStore()

  return (
    <div>
      <Button onClick={() => createPost()}>New Post</Button>
      {posts.map(post => (
        <Card onClick={() => viewPost(post.id)}>
          {post.title}
        </Card>
      ))}
    </div>
  )
}
```

#### Optimistic Updates

```tsx
// 좋아요 기능 예시
const { mutate: likePost } = useMutation({
  mutationFn: postsAPI.like,
  onMutate: async (postId) => {
    // 낙관적 업데이트
    queryClient.setQueryData(['posts', postId], (old) => ({
      ...old,
      likes: old.likes + 1
    }))
  },
  onError: (err, postId, context) => {
    // 실패 시 롤백
    queryClient.setQueryData(['posts', postId], context.previousPost)
  }
})
```

---

## 🧪 6. 테스트 프레임워크

### 생성된 파일

**설정:**
- ✅ `vitest.config.ts`
- ✅ `playwright.config.ts`
- ✅ `src/tests/setup.ts`

**예시 테스트:**
- ✅ `e2e/example.spec.ts`

### 사용 방법

#### Vitest 유닛 테스트

```bash
# 테스트 실행
npm run test

# Watch 모드
npm run test

# UI 모드
npm run test:ui

# 한 번만 실행
npm run test:run
```

**예시 테스트 작성:**

```typescript
// src/components/PostCard.test.tsx
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { PostCard } from './PostCard'

test('renders post title', () => {
  const post = {
    id: 1,
    title: 'Test Post',
    content: 'Test content',
    author: 'John'
  }

  render(<PostCard post={post} />)

  expect(screen.getByText('Test Post')).toBeDefined()
})
```

#### Playwright E2E 테스트

```bash
# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui
```

**예시 E2E 테스트:**

```typescript
// e2e/posts.spec.ts
import { test, expect } from '@playwright/test'

test('create a new post', async ({ page }) => {
  await page.goto('/')

  // Click New Post button
  await page.click('text=New Post')

  // Fill form
  await page.fill('[name="title"]', 'My Test Post')
  await page.fill('[name="content"]', 'This is a test')
  await page.fill('[name="author"]', 'Tester')

  // Submit
  await page.click('button[type="submit"]')

  // Verify post appears in list
  await expect(page.locator('text=My Test Post')).toBeVisible()
})
```

---

## 🚀 7. CI/CD 파이프라인

### 생성된 파일

- ✅ `.github/workflows/ci.yml` - 메인 CI 파이프라인
- ✅ `.github/workflows/codeql.yml` - 보안 스캔

### CI 파이프라인 구성

**Jobs:**
1. **Backend Lint & Type Check**
   - TypeScript 타입 체크
   - ESLint 검사

2. **Frontend Lint & Test**
   - ESLint 검사
   - Vitest 유닛 테스트
   - 빌드 검증

3. **E2E Tests**
   - Backend 서버 시작
   - Playwright E2E 테스트
   - 테스트 리포트 업로드

4. **CodeQL Security Scan**
   - 보안 취약점 스캔
   - 매주 월요일 자동 실행

### 로컬에서 CI 시뮬레이션

```bash
# Backend
cd backend
npm run type-check
npm run lint

# Frontend
cd frontend
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

---

## 📁 업데이트된 디렉토리 구조

```
bulletin-board/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # 🆕 CI 파이프라인
│       └── codeql.yml                # 🆕 보안 스캔
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   │   └── validate.ts           # 🆕 Zod 미들웨어
│   │   ├── schemas/                  # 🆕 Zod 스키마
│   │   │   ├── post.schema.ts
│   │   │   └── comment.schema.ts
│   │   ├── lib/                      # 🆕 유틸리티
│   │   │   └── env.ts                # 🆕 환경 변수 검증
│   │   ├── types/                    # 🆕 타입 정의
│   │   │   └── common.types.ts
│   │   └── app.js
│   ├── tsconfig.json                 # 🆕 TypeScript 설정
│   ├── eslint.config.js              # 🆕 ESLint 설정
│   ├── .prettierrc.json              # 🆕 Prettier 설정
│   └── package.json                  # 🔄 업데이트
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/                   # 🆕 Shadcn UI
│   │   │       ├── button.tsx
│   │   │       └── card.tsx
│   │   ├── hooks/                    # 🆕 커스텀 훅
│   │   │   └── usePosts.ts           # 🆕 React Query
│   │   ├── stores/                   # 🆕 Zustand
│   │   │   └── ui.store.ts
│   │   ├── lib/                      # 🆕 유틸리티
│   │   │   ├── utils.ts              # 🆕 cn 함수
│   │   │   └── query-client.ts       # 🆕 React Query
│   │   ├── types/                    # 🆕 타입 정의
│   │   │   └── common.types.ts
│   │   ├── tests/                    # 🆕 테스트 설정
│   │   │   └── setup.ts
│   │   ├── services/
│   │   ├── index.css                 # 🔄 Tailwind 추가
│   │   └── App.jsx
│   ├── e2e/                          # 🆕 E2E 테스트
│   │   └── example.spec.ts
│   ├── tsconfig.json                 # 🆕 TypeScript 설정
│   ├── tailwind.config.js            # 🆕 Tailwind 설정
│   ├── postcss.config.js             # 🆕 PostCSS 설정
│   ├── vite.config.ts                # 🔄 Path alias
│   ├── vitest.config.ts              # 🆕 Vitest 설정
│   ├── playwright.config.ts          # 🆕 Playwright 설정
│   ├── eslint.config.js              # 🔄 업데이트
│   ├── .prettierrc.json              # 🆕 Prettier 설정
│   └── package.json                  # 🔄 업데이트
├── docs/
│   ├── ANALYSIS_REPORT.md            # 🆕 분석 리포트
│   └── MIGRATION_GUIDE.md            # 🆕 이 문서
└── README.md
```

**범례:**
- 🆕 새로 생성된 파일/폴더
- 🔄 업데이트된 파일

---

## 🚦 다음 단계 (권장)

### 즉시 적용 가능

1. **환경 변수 검증 적용**
   ```typescript
   // server.js 상단에 추가
   import { env } from './src/lib/env'
   // 이제 env.PORT는 타입 안전!
   ```

2. **Zod 스키마를 라우트에 적용**
   ```typescript
   // src/routes/posts.js → posts.ts
   import { validate } from '@/middleware/validate'
   import { createPostSchema } from '@/schemas/post.schema'

   router.post('/', validate(createPostSchema, 'body'), createPost)
   ```

3. **React Query로 데이터 페칭 교체**
   ```tsx
   // PostList.jsx → PostList.tsx
   import { usePosts } from '@/hooks/usePosts'

   const { data, isLoading } = usePosts(page)
   ```

4. **Shadcn UI 컴포넌트로 교체**
   ```tsx
   // 기존 <button> → <Button>
   // 기존 <div class="card"> → <Card>
   ```

### 점진적 개선

5. **JavaScript 파일을 TypeScript로 변환**
   - 중요한 파일부터 시작 (컨트롤러, 모델)
   - 하나씩 `.js` → `.ts` 변환
   - 타입 추가

6. **테스트 작성**
   - 주요 컴포넌트 유닛 테스트
   - 주요 사용자 플로우 E2E 테스트

7. **CI/CD 활성화**
   - GitHub에 푸시
   - Actions 탭에서 CI 결과 확인
   - 실패 시 수정

---

## 🔧 문제 해결

### TypeScript 에러

```bash
# 타입 체크 실행
npm run type-check

# 점진적 마이그레이션: 에러 무시
// @ts-nocheck  # 파일 상단에 추가
```

### ESLint 에러 (세미콜론)

```bash
# 자동 수정
npm run lint:fix
npm run format
```

### Tailwind가 작동하지 않음

```bash
# index.css 확인
@tailwind base;
@tailwind components;
@tailwind utilities;

# tailwind.config.js의 content 경로 확인
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

### React Query 에러

```tsx
// QueryClientProvider 확인
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

---

## 📊 적용 전후 비교

### Before (적용 전)

```javascript
// JavaScript, 세미콜론 있음
const { body } = require('express-validator');

exports.createPost = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ...
};
```

```jsx
// 기본 CSS, useState
const [posts, setPosts] = useState([]);

useEffect(() => {
  fetchPosts();
}, []);

<div className="post-item">
  <h3>{post.title}</h3>
</div>
```

### After (적용 후)

```typescript
// TypeScript, 세미콜론 없음, Zod
import { validate } from '@/middleware/validate'
import { createPostSchema } from '@/schemas/post.schema'

router.post('/', validate(createPostSchema, 'body'), createPost)

export const createPost = (req: Request, res: Response) => {
  const data: CreatePostInput = req.body // 타입 안전!
  // ...
}
```

```tsx
// Shadcn UI, React Query
import { usePosts } from '@/hooks/usePosts'
import { Card, CardTitle } from '@/components/ui/card'

const { data, isLoading } = usePosts(page)

<Card className="p-4 hover:shadow-lg transition-shadow">
  <CardTitle>{post.title}</CardTitle>
</Card>
```

---

## ✅ 체크리스트

### 설정 완료

- [x] TypeScript 설정 (tsconfig.json)
- [x] ESLint + Prettier (세미콜론 없음)
- [x] Zod 스키마 및 검증
- [x] Shadcn UI + Tailwind CSS
- [x] React Query 설정
- [x] Zustand 상태 관리
- [x] Vitest 유닛 테스트
- [x] Playwright E2E 테스트
- [x] GitHub Actions CI/CD

### 다음 작업 (사용자가 수행)

- [ ] 기존 코드를 TypeScript로 변환
- [ ] express-validator → Zod로 교체
- [ ] 기존 CSS → Tailwind로 교체
- [ ] useState → React Query로 교체
- [ ] 테스트 작성
- [ ] CI/CD 검증

---

## 🎯 결론

**데이터베이스(SQLite)와 프레임워크(Express + React)를 유지하면서** global.mdc 규칙의 나머지 부분을 성공적으로 적용했습니다.

**적용된 개선사항:**
- ✅ TypeScript 타입 안전성
- ✅ 코드 스타일 통일 (세미콜론 없음)
- ✅ Zod 검증으로 런타임 안전성
- ✅ Shadcn UI + Tailwind로 현대적인 UI
- ✅ React Query로 서버 상태 관리 개선
- ✅ Zustand로 클라이언트 상태 관리
- ✅ Vitest + Playwright 테스트 자동화
- ✅ GitHub Actions CI/CD 파이프라인

**유지된 부분:**
- ✅ Express.js 백엔드
- ✅ SQLite 데이터베이스
- ✅ REST API 아키텍처
- ✅ React CSR 프론트엔드

---

**마이그레이션 작업 완료일**: 2026-02-09
**작업자**: Claude Sonnet 4.5
**문서 버전**: 1.0
