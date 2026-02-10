const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.warn('GEMINI_API_KEY가 설정되지 않았습니다. AI 답변 생성이 작동하지 않습니다.');
      this.client = null;
      this.model = null;
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
      logger.info('Gemini Service 초기화 완료', {
        apiKey: logger.maskApiKey(apiKey),
        model: 'gemini-2.5-flash'
      });
    } catch (error) {
      logger.error('Gemini Service 초기화 실패', { error: error.message });
      this.client = null;
      this.model = null;
    }
  }

  /**
   * 서비스 사용 가능 여부 확인
   */
  isAvailable() {
    return this.model !== null;
  }

  /**
   * 게시글 분석 및 검색 쿼리 추출
   * @param {Object} post - 게시글 객체 { id, title, content, author }
   * @returns {Promise<string>} 검색 쿼리
   */
  async analyzePost(post) {
    if (!this.isAvailable()) {
      throw new Error('Gemini Service를 사용할 수 없습니다');
    }

    const prompt = `
다음 게시글의 핵심 질문이나 주제를 파악하고,
웹 검색에 사용할 최적의 검색 쿼리를 생성해주세요.

제목: ${post.title}
내용: ${post.content}

검색 쿼리만 간단히 출력해주세요 (30자 이내, 한국어 또는 영어).
`;

    try {
      logger.info(`게시글 분석 시작 [Post ${post.id}]`);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const searchQuery = response.text().trim();

      logger.info(`게시글 분석 완료 [Post ${post.id}]`, {
        searchQuery
      });

      return searchQuery;
    } catch (error) {
      logger.error(`게시글 분석 실패 [Post ${post.id}]`, {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * 검색 결과 기반 답변 생성
   * @param {Object} post - 게시글 객체
   * @param {Array} searchResults - 검색 결과 배열
   * @returns {Promise<string>} AI 답변
   */
  async generateAnswer(post, searchResults) {
    if (!this.isAvailable()) {
      throw new Error('Gemini Service를 사용할 수 없습니다');
    }

    // 검색 결과가 없으면 기본 답변 생성
    if (!searchResults || searchResults.length === 0) {
      logger.warn(`검색 결과 없음, 기본 답변 생성 [Post ${post.id}]`);
      return this.generateBasicAnswer(post);
    }

    const searchResultsText = searchResults
      .map((r, i) => `${i + 1}. ${r.title}\n   ${r.content}\n   출처: ${r.url}`)
      .join('\n\n');

    const prompt = `
다음 게시글에 대해 웹 검색 결과를 참고하여 정확하고 도움이 되는 답변을 작성해주세요.

게시글 제목: ${post.title}
게시글 내용: ${post.content}

웹 검색 결과:
${searchResultsText}

요구사항:
- 검색 결과를 바탕으로 정확한 정보 제공
- 200~400자 내외로 작성 (너무 길지 않게)
- 친절하고 이해하기 쉬운 설명
- 필요시 출처 링크 포함
- 한국어로 답변

답변:
`;

    try {
      logger.info(`AI 답변 생성 시작 [Post ${post.id}]`);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text().trim();

      logger.info(`AI 답변 생성 완료 [Post ${post.id}]`, {
        answerLength: answer.length
      });

      return answer;
    } catch (error) {
      logger.error(`AI 답변 생성 실패 [Post ${post.id}]`, {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * 검색 결과 없이 기본 답변 생성
   * @param {Object} post - 게시글 객체
   * @returns {Promise<string>} 기본 답변
   */
  async generateBasicAnswer(post) {
    const prompt = `
다음 게시글에 대해 일반적인 답변을 작성해주세요.

제목: ${post.title}
내용: ${post.content}

요구사항:
- 200~300자 내외로 작성
- 친절하고 도움이 되는 답변
- 한국어로 답변

답변:
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error(`기본 답변 생성 실패 [Post ${post.id}]`, {
        error: error.message
      });
      // 최후의 수단: 하드코딩된 답변
      return '죄송합니다. 현재 AI 답변을 생성할 수 없습니다. 나중에 다시 시도해주세요.';
    }
  }
}

// 싱글톤 인스턴스
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new GeminiService();
    }
    return instance;
  },
  GeminiService
};
