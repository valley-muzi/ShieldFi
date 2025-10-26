// src/routes/index.js
import { Router } from 'express';
import productRouter from './product.routes.js';
import claimRouter from './claim.routes.js';

const r = Router();

// product API 연결
r.use('/products', productRouter);

// claim API 연결
r.use('/claim', claimRouter);

// 기존 라우트
r.post('/login', (req, res) => {
  res.json({ ok: true });
});

r.post('/register', (req, res) => {
  res.json({ ok: true });
});

export default r;
