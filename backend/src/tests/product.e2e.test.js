import request from 'supertest';
import app from '../app.js';
import { connectDB, pool } from '../config/db.config.js';

beforeAll(async () => { await connectDB(); });
afterAll(async () => { await pool.end(); });

test('GET /api/products -> 200', async () => {
  const res = await request(app).get('/api/products');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('success', true);
  expect(Array.isArray(res.body.data)).toBe(true);
});
