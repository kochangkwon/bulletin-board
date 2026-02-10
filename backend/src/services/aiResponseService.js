const { getInstance: getGeminiService } = require('./geminiService');
const { getInstance: getTavilyService } = require('./tavilyService');
const Comment = require('../models/Comment');
const logger = require('../utils/logger');

class AIResponseService {
  constructor() {
    this.geminiService = getGeminiService();
    this.tavilyService = getTavilyService();
    this.maxRetry = parseInt(process.env.AI_MAX_RETRY) || 2;
    this.timeout = parseInt(process.env.AI_RESPONSE_TIMEOUT) || 10000;
  }

  /**
   * 서비스 사용 가능 여부 확인
   */
  isEnabled() {
    const enabled = process.env.AI_RESPONSE_ENABLED === 'true';
    const geminiAvailable = this.geminiService.isAvailable();

    if (!enabled) {
      logger.info('AI 답변 기능이 비활성화되어 있습니다 (AI_RESPONSE_ENABLED=false)');
      return false;
    }

    if (!geminiAvailable) {
      logger.warn('Gemini Service를 사용할 수 없어 AI 답변 기능이 작동하지 않습니다');
      return false;
    }

    return true;
  }

  /**
   * 게시글에 대한 AI 답변 생성 (메인 오케스트레이션)
   * @param {Object} post - 게시글 객체 { id, title, content, author }
   * @returns {Promise<Object>} 생성된 댓글 객체
   */
  async generateResponse(post) {
    if (!this.isEnabled()) {
      logger.info(`AI 답변 생성 스킵 [Post ${post.id}] - 기능 비활성화`);
      return null;
    }

    const startTime = Date.now();
    logger.info(`AI 답변 생성 시작 [Post ${post.id}]`, {
      postTitle: post.title
    });

    try {
      // 타임아웃 설정
      const result = await Promise.race([
        this._generateResponseWithRetry(post),
        this._timeoutPromise(this.timeout)
      ]);

      const duration = Date.now() - startTime;
      logger.info(`AI 답변 생성 성공 [Post ${post.id}]`, {
        duration: `${duration}ms`,
        commentId: result.id
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.message === 'AI_TIMEOUT') {
        logger.error(`AI 답변 생성 타임아웃 [Post ${post.id}]`, {
          duration: `${duration}ms`,
          timeout: `${this.timeout}ms`
        });
      } else {
        logger.error(`AI 답변 생성 실패 [Post ${post.id}]`, {
          duration: `${duration}ms`,
          error: error.message,
          stack: error.stack
        });
      }

      return null;
    }
  }

  /**
   * 재시도 로직이 포함된 답변 생성
   * @private
   */
  async _generateResponseWithRetry(post) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetry + 1; attempt++) {
      try {
        return await this._generateResponseInternal(post);
      } catch (error) {
        lastError = error;
        logger.warn(`AI 답변 생성 재시도 [Post ${post.id}] - ${attempt}/${this.maxRetry + 1}`, {
          error: error.message
        });

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt <= this.maxRetry) {
          await this._sleep(1000 * attempt); // 1초, 2초, 3초...
        }
      }
    }

    throw lastError;
  }

  /**
   * 실제 답변 생성 로직
   * @private
   */
  async _generateResponseInternal(post) {
    // 1. 게시글 분석 및 검색 쿼리 추출
    const searchQuery = await this.geminiService.analyzePost(post);

    // 2. 웹 검색 (실패해도 계속 진행)
    let searchResults = [];
    if (this.tavilyService.isAvailable()) {
      searchResults = await this.tavilyService.search(searchQuery);
    } else {
      logger.info(`Tavily Service 미사용 [Post ${post.id}] - 검색 없이 답변 생성`);
    }

    // 3. 검색 결과 기반 답변 생성
    const answer = await this.geminiService.generateAnswer(post, searchResults);

    // 4. 댓글로 등록
    const comment = Comment.create({
      post_id: post.id,
      content: answer,
      author: 'AI'
    });

    return comment;
  }

  /**
   * 타임아웃 Promise
   * @private
   */
  _timeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('AI_TIMEOUT'));
      }, ms);
    });
  }

  /**
   * Sleep helper
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 싱글톤 인스턴스
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new AIResponseService();
    }
    return instance;
  },
  AIResponseService
};
