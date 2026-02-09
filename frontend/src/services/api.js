const API_BASE_URL = 'http://localhost:3000/api';

// 공통 fetch 함수
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API 요청 실패');
  }

  return data;
}

// Posts API
export const postsAPI = {
  // 모든 게시글 조회
  getAll: (page = 1, limit = 10, search = '') => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return fetchAPI(`/posts?page=${page}&limit=${limit}${searchParam}`);
  },

  // 게시글 상세 조회
  getById: (id) => {
    return fetchAPI(`/posts/${id}`);
  },

  // 게시글 생성
  create: (postData) => {
    return fetchAPI('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // 게시글 수정
  update: (id, postData) => {
    return fetchAPI(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  },

  // 게시글 삭제
  delete: (id) => {
    return fetchAPI(`/posts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Comments API
export const commentsAPI = {
  // 게시글의 댓글 조회
  getByPostId: (postId) => {
    return fetchAPI(`/posts/${postId}/comments`);
  },

  // 댓글 생성
  create: (postId, commentData) => {
    return fetchAPI(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  // 댓글 삭제
  delete: (id) => {
    return fetchAPI(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};
