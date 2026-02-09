const Post = require('../models/Post');
const { validationResult } = require('express-validator');

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

    res.status(201).json({
      success: true,
      message: '게시글이 생성되었습니다',
      data: post
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
