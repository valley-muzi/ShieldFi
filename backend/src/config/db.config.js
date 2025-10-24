// src/config/db.config.js
import pkg from 'pg';
const { Pool } = pkg;
import { env } from './env.js';

export const pool = new Pool({
  user: env.DB_USER || 'postgres',
  host: env.DB_HOST || 'localhost',
  database: env.DB_NAME || 'shieldfi',
  password: env.DB_PASSWORD || 'password',
  port: env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('[db] PostgreSQL connected successfully');
    client.release();
  } catch (err) {
    console.error('[db] PostgreSQL connection error:', err.message);
    // 테스트/스크립트에서 종료되면 이후 정리 못함
    // process.exit(1);
    throw err; // 호출한 쪽에서 처리
  }
};

// 자동 실행 금지
// await connectDB();
