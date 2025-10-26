import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

import 'dotenv/config'; // .env 읽기용
import verifyTxRouter from './routes/verifyTx.routes.js';
import nft1155Router from './routes/nft1155.routes.js';

/**
 * Express Application Setup
 * 
 * ShieldFi 백엔드 API 서버의 메인 Express 애플리케이션을 설정합니다.
 * 보안, CORS, 로깅, 속도 제한 등의 미들웨어를 구성하고,
 * API 라우트와 에러 핸들러를 등록합니다.
 * 
 * @author ShieldFi Team
 * @version 1.0.0
 */

// CORS 설정 (모든 도메인 허용, 자격 증명 불필요)
//app.use(cors({ origin: '*', credentials: false }));

// Express 애플리케이션 인스턴스 생성
const app = express();

// ===== 보안 미들웨어 =====
// HTTP 헤더를 설정하여 일반적인 웹 취약점으로부터 보호
app.use(helmet());

// ===== CORS 설정 =====
// Cross-Origin Resource Sharing을 허용하여 다른 도메인에서의 API 접근을 가능하게 함
app.use(cors());

// ===== 요청 파싱 미들웨어 =====
// JSON 형태의 요청 본문을 파싱하여 req.body에 저장
app.use(express.json());

// ===== 로깅 미들웨어 =====
// HTTP 요청에 대한 로그를 콘솔에 출력 (개발 환경용)
app.use(morgan('dev'));

// ===== 속도 제한 미들웨어 =====
// 1분(60초) 동안 최대 120개의 요청만 허용하여 DDoS 공격 방지
app.use(rateLimit({ 
  windowMs: 60_000,  // 시간 윈도우: 60초
  max: 120           // 최대 요청 수: 120개
}));

// ===== 라우트 설정 =====
// 헬스 체크 엔드포인트 (서버 상태 확인용)
app.get('/health', (_req, res) => res.json({ ok: true }));

// 트랜잭션 검증 엔드포인트
app.use('/api', verifyTxRouter);
// NFT 1155 검증 엔드포인트
app.use('/api', nft1155Router);

// API 라우트 등록 (모든 /api/* 경로는 router에서 처리)
app.use('/api', router);

// ===== 에러 핸들러 =====
// 모든 라우트에서 발생하는 에러를 처리하는 최종 미들웨어
// 반드시 다른 모든 미들웨어와 라우트보다 뒤에 위치해야 함
app.use(errorHandler);

// Express 애플리케이션 내보내기
export default app;
