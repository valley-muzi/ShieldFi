// src/server.js
import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.config.js';

const PORT = Number(process.env.PORT) || 4000;

(async () => {
  await connectDB(); // 서버 시작 시에만 연결 확인
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`[server] listening on http://localhost:${PORT}`)
  );
})();
