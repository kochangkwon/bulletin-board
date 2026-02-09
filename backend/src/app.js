const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// 라우트 import
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

// Express 앱 생성
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bulletin Board API',
      version: '1.0.0',
      description: 'A production-level bulletin board API with posts and comments',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Posts',
        description: 'Post management endpoints'
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// API 문서 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API 라우트
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 루트 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Bulletin Board API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
