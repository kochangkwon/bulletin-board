const db = require('../config/database');

class Comment {
  // 특정 게시글의 모든 댓글 조회
  static getByPostId(postId) {
    return db.prepare(`
      SELECT * FROM comments
      WHERE post_id = ?
      ORDER BY created_at ASC
    `).all(postId);
  }

  // 댓글 ID로 조회
  static getById(id) {
    return db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  }

  // 새 댓글 생성
  static create(data) {
    const { post_id, content, author } = data;
    const result = db.prepare(`
      INSERT INTO comments (post_id, content, author)
      VALUES (?, ?, ?)
    `).run(post_id, content, author);

    return this.getById(result.lastInsertRowid);
  }

  // 댓글 삭제
  static delete(id) {
    const result = db.prepare('DELETE FROM comments WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = Comment;
