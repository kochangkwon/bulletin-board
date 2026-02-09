import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import './PostForm.css';

function PostForm({ postId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!postId;

  useEffect(() => {
    if (isEditMode) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await postsAPI.getById(postId);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        author: response.data.author,
      });
    } catch (err) {
      setError('게시글 로드 실패: ' + err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
      setError('모든 필드를 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await postsAPI.update(postId, {
          title: formData.title,
          content: formData.content,
        });
      } else {
        await postsAPI.create(formData);
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form">
      <h2>{isEditMode ? '게시글 수정' : '게시글 작성'}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">제목 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="제목을 입력하세요"
            maxLength={200}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">글쓴이 *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="이름을 입력하세요"
            maxLength={50}
            required
            disabled={isEditMode}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">내용 *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="내용을 입력하세요"
            rows={10}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '저장 중...' : (isEditMode ? '수정' : '등록')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostForm;
