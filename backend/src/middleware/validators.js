const { body } = require('express-validator');

// 게시글 생성 유효성 검증
exports.validateCreatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('제목은 필수입니다')
    .isLength({ min: 1, max: 200 }).withMessage('제목은 1자 이상 200자 이하여야 합니다'),
  body('content')
    .trim()
    .notEmpty().withMessage('내용은 필수입니다')
    .isLength({ min: 1 }).withMessage('내용을 입력해주세요'),
  body('author')
    .trim()
    .notEmpty().withMessage('글쓴이는 필수입니다')
    .isLength({ min: 1, max: 50 }).withMessage('글쓴이는 1자 이상 50자 이하여야 합니다')
];

// 게시글 수정 유효성 검증 (author는 변경 불가)
exports.validateUpdatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('제목은 필수입니다')
    .isLength({ min: 1, max: 200 }).withMessage('제목은 1자 이상 200자 이하여야 합니다'),
  body('content')
    .trim()
    .notEmpty().withMessage('내용은 필수입니다')
    .isLength({ min: 1 }).withMessage('내용을 입력해주세요')
];

// 댓글 생성 유효성 검증 (대댓글 지원)
exports.validateComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('내용은 필수입니다')
    .isLength({ min: 1, max: 500 }).withMessage('댓글은 1자 이상 500자 이하여야 합니다'),
  body('author')
    .trim()
    .notEmpty().withMessage('글쓴이는 필수입니다')
    .isLength({ min: 1, max: 50 }).withMessage('글쓴이는 1자 이상 50자 이하여야 합니다'),
  body('parent_id')
    .optional()
    .isInt().withMessage('상위 댓글 ID는 정수여야 합니다')
];
