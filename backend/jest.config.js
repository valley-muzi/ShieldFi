// backend/jest.config.js
export default {
  testEnvironment: 'node',
  // 테스트 파일 패턴: 현재 product.test.js 위치가 잡히도록 범용 패턴 유지
  testMatch: ['**/tests/**/*.test.js', '**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', 'src/tests/claim.test.js', 'src/tests/policy.test.js'],
  
  // 변환(트랜스폼) 안 쓰면 비워둠
  transform: {},

  // 오타 수정: moduleNameMapper (필요 없으면 {}로 둬도 됨)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // 커버리지 옵션은 유지/삭제 자유
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
