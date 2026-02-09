const db = require('../config/database');

class Post {
  // 모든 게시글 조회 (페이지네이션 및 검색 지원)
  static getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, title, content, author, created_at, updated_at
      FROM posts
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM posts';
    const params = [];
    const countParams = [];

    // 검색어가 있는 경우 WHERE 절 추가
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` WHERE title LIKE ? OR content LIKE ? OR author LIKE ?`;
      countQuery += ` WHERE title LIKE ? OR content LIKE ? OR author LIKE ?`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
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

  // 게시글 ID로 조회
  static getById(id) {
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  }

  // 새 게시글 생성
  static create(data) {
    const { title, content, author } = data;
    const result = db.prepare(`
      INSERT INTO posts (title, content, author)
      VALUES (?, ?, ?)
    `).run(title, content, author);

    return this.getById(result.lastInsertRowid);
  }

  // 게시글 수정
  static update(id, data) {
    const { title, content } = data;
    db.prepare(`
      UPDATE posts
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, id);

    return this.getById(id);
  }

  // 게시글 삭제
  static delete(id) {
    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // 게시글의 댓글 수 조회
  static getCommentsCount(id) {
    const result = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(id);
    return result.count;
  }
}

module.exports = Post;
