// src/routes/index.js
import { Router } from 'express';
import productRouter from './product.routes.js';  

const r = Router();

// product API 연결
r.use('/products', productRouter);

// 기존 라우트
r.post('/login', (req, res) => {
  res.json({ ok: true });
});

r.post('/register', (req, res) => {
  res.json({ ok: true });
});

export default r;
