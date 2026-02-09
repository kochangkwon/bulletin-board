const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { validationResult } = require('express-validator');

// 특정 게시글의 모든 댓글 조회
exports.getComments = (req, res) => {
  try {
    const post = Post.getById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다'
      });
    }

    const comments = Comment.getByPostId(req.params.postId);

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '댓글 조회 실패',
      error: error.message
    });
  }
};

// 댓글 생성
exports.createComment = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = Post.getById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '게시글을 찾을 수 없습니다'
      });
    }

    const commentData = {
      post_id: req.params.postId,
      content: req.body.content,
      author: req.body.author
    };

    const comment = Comment.create(commentData);

    res.status(201).json({
      success: true,
      message: '댓글이 생성되었습니다',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '댓글 생성 실패',
      error: error.message
    });
  }
};

// 댓글 삭제
exports.deleteComment = (req, res) => {
  try {
    const success = Comment.delete(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '댓글 삭제 실패',
      error: error.message
    });
  }
};
