const winston = require('winston');
const path = require('path');

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 콘솔 로그 포맷 (개발 환경용)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Logger 생성
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // AI 관련 로그 파일
    new winston.transports.File({
      filename: path.join('logs', 'ai-response.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// API 키 마스킹 헬퍼 함수
logger.maskApiKey = (key) => {
  if (!key) return '(empty)';
  if (key.length < 8) return '***';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

module.exports = logger;
