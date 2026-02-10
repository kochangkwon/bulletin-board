const Post = require('../models/Post');
const { validationResult } = require('express-validator');
const { getInstance: getAIResponseService } = require('../services/aiResponseService');
const logger = require('../utils/logger');

// 모든 게시글 조회
exports.getAllPosts = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const result = Post.getAll(page, limit, search);

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '게시글 조회 실패',
      error: error.message
    });
  }
};

// 특정 게시글 조회
exports.getPost = (req, res) => {
  try {
    const post = Post.getById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '게시글 조회 실패',
      error: error.message
    });
  }
};

// 게시글 생성
exports.createPost = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = Post.create(req.body);

    // 즉시 응답 (사용자는 게시글 생성 완료 응답을 바로 받음)
    res.status(201).json({
      success: true,
      message: '게시글이 생성되었습니다',
      data: post
    });

    // [비동기] AI 답변 생성 (응답 후 백그라운드에서 실행)
    // 사용자는 이미 응답을 받았으므로 AI 답변 생성을 기다리지 않음
    setImmediate(async () => {
      try {
        const aiResponseService = getAIResponseService();
        await aiResponseService.generateResponse(post);
      } catch (error) {
        // AI 답변 생성 실패는 로그만 기록하고 사용자에게 영향 없음
        logger.error('AI 답변 생성 중 예외 발생', {
          postId: post.id,
          error: error.message,
          stack: error.stack
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '게시글 생성 실패',
      error: error.message
    });
  }
};

// 게시글 수정
exports.updatePost = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const existingPost = Post.getById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다'
      });
    }

    const post = Post.update(req.params.id, req.body);

    res.json({
      success: true,
      message: '게시글이 수정되었습니다',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '게시글 수정 실패',
      error: error.message
    });
  }
};

// 게시글 삭제
exports.deletePost = (req, res) => {
  try {
    const success = Post.delete(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '게시글이 삭제되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '게시글 삭제 실패',
      error: error.message
    });
  }
};
