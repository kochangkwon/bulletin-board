const axios = require('axios');
const logger = require('../utils/logger');

class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseURL = 'https://api.tavily.com';

    if (!this.apiKey) {
      logger.warn('TAVILY_API_KEY가 설정되지 않았습니다. 웹 검색이 작동하지 않습니다.');
    } else {
      logger.info('Tavily Service 초기화 완료', {
        apiKey: logger.maskApiKey(this.apiKey)
      });
    }
  }

  /**
   * 서비스 사용 가능 여부 확인
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * 웹 검색 수행
   * @param {string} query - 검색 쿼리
   * @returns {Promise<Array>} 검색 결과 배열
   */
  async search(query) {
    if (!this.isAvailable()) {
      logger.warn('Tavily Service를 사용할 수 없습니다. 빈 검색 결과 반환');
      return [];
    }

    try {
      logger.info('웹 검색 시작', { query });

      const response = await axios.post(
        `${this.baseURL}/search`,
        {
          api_key: this.apiKey,
          query: query,
          search_depth: 'basic',
          include_answer: false,
          include_raw_content: false,
          max_results: 3,
          include_domains: [],
          exclude_domains: []
        },
        {
          timeout: 5000, // 5초 타임아웃
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const results = response.data.results || [];
      const formattedResults = results.map(result => ({
        title: result.title || '',
        content: result.content || '',
        url: result.url || '',
        score: result.score || 0
      }));

      logger.info('웹 검색 완료', {
        query,
        resultCount: formattedResults.length
      });

      return formattedResults;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        logger.error('웹 검색 타임아웃', { query, error: error.message });
      } else if (error.response) {
        logger.error('웹 검색 실패 (API 응답 오류)', {
          query,
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        logger.error('웹 검색 실패 (네트워크 오류)', {
          query,
          error: error.message
        });
      } else {
        logger.error('웹 검색 실패 (알 수 없는 오류)', {
          query,
          error: error.message,
          stack: error.stack
        });
      }

      // 에러 발생 시 빈 배열 반환 (검색 없이 답변 생성 시도)
      return [];
    }
  }
}

// 싱글톤 인스턴스
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new TavilyService();
    }
    return instance;
  },
  TavilyService
};
