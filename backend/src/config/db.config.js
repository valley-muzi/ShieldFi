import pkg from 'pg';
const { Pool } = pkg;
import { env } from './env.js';

/**
 * Database Configuration
 * 
 * PostgreSQL 데이터베이스 연결 설정을 관리하는 모듈입니다.
 * 연결 풀(Connection Pool)을 사용하여 데이터베이스 연결을 효율적으로 관리하고,
 * 애플리케이션 시작 시 데이터베이스 연결을 초기화합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */

/**
 * PostgreSQL 연결 풀 인스턴스
 * 
 * 여러 데이터베이스 연결을 미리 생성하고 재사용하여 성능을 최적화합니다.
 * 환경 변수에서 데이터베이스 설정을 읽어와 연결 풀을 구성합니다.
 * 
 * @type {Pool} PostgreSQL 연결 풀 객체
 * @property {string} user - 데이터베이스 사용자명
 * @property {string} host - 데이터베이스 호스트 주소
 * @property {string} database - 데이터베이스 이름
 * @property {string} password - 데이터베이스 비밀번호
 * @property {number} port - 데이터베이스 포트 번호
 * @property {number} max - 최대 연결 수 (20개)
 * @property {number} idleTimeoutMillis - 유휴 연결 타임아웃 (30초)
 * @property {number} connectionTimeoutMillis - 연결 타임아웃 (2초)
 */
export const pool = new Pool({
  user: env.DB_USER || 'postgres',           // 데이터베이스 사용자명 (기본값: postgres)
  host: env.DB_HOST || 'localhost',          // 데이터베이스 호스트 (기본값: localhost)
  database: env.DB_NAME || 'shieldfi',       // 데이터베이스 이름 (기본값: shieldfi)
  password: env.DB_PASSWORD || 'password',   // 데이터베이스 비밀번호 (기본값: password)
  port: env.DB_PORT || 5432,                 // 데이터베이스 포트 (기본값: 5432)
  max: 20,                                   // 최대 연결 수 (동시 처리 가능한 최대 연결)
  idleTimeoutMillis: 30000,                  // 유휴 연결 타임아웃 (30초 후 연결 해제)
  connectionTimeoutMillis: 2000,             // 연결 타임아웃 (2초 내 연결 실패 시 에러)
});

/**
 * 데이터베이스 연결 테스트 및 초기화
 * 
 * 애플리케이션 시작 시 데이터베이스 연결이 정상적으로 작동하는지 확인합니다.
 * 연결에 실패할 경우 애플리케이션을 종료하여 오류를 방지합니다.
 * 
 * @returns {Promise<void>} 연결 성공 시 Promise 해결, 실패 시 프로세스 종료
 * 
 * @throws {Error} 데이터베이스 연결 실패 시 프로세스 종료 (exit code: 1)
 * 
 * @example
 * // 애플리케이션 시작 시 자동으로 호출됨
 * await connectDB();
 */
export const connectDB = async () => {
  try {
    // 연결 풀에서 클라이언트 연결 획득
    const client = await pool.connect();
    
    // 연결 성공 로그 출력
    console.log('[db] PostgreSQL connected successfully');
    
    // 사용한 클라이언트를 풀로 반환
    client.release();
  } catch (err) {
    // 연결 실패 시 에러 로그 출력 및 프로세스 종료
    console.error('[db] PostgreSQL connection error:', err.message);
    process.exit(1);
  }
};

// 애플리케이션 시작 시 데이터베이스 연결 초기화
// 모듈이 로드되는 즉시 실행되어 데이터베이스 연결을 확인합니다.
await connectDB();
