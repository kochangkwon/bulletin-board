const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '../../database.sqlite');

// 데이터베이스 인스턴스 생성
const db = new Database(dbPath, { verbose: console.log });

// 외래 키 제약 조건 활성화
db.pragma('foreign_keys = ON');

// 테이블 초기화
function initializeDatabase() {
  // posts 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // comments 테이블 생성
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

// 데이터베이스 초기화 실행
initializeDatabase();

module.exports = db;
