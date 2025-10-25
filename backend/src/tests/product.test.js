// src/tests/product.test.js
import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { connectDB, pool } from '../config/db.config.js';
import { ProductService } from '../services/product.service.js';
import { ProductModel } from '../models/product.model.js';

jest.setTimeout(15000);

// 테스트 전 한번만 연결
beforeAll(async () => {
  await connectDB();
});

// 테스트 끝나고 한번만 종료
afterAll(async () => {
  await pool.end();
});

describe('Product Model', () => {
  it('should return array of products', async () => {
    const products = await ProductModel.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});

describe('Product Service', () => {
  it('should return all products with success/count keys', async () => {
    const result = await ProductService.getAllProducts();
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('count');
    expect(Array.isArray(result.data)).toBe(true);
  });

  it('should return product structure when data exists', async () => {
    const result = await ProductService.getAllProducts();
    if (result.data.length > 0) {
      const p = result.data[0];
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('tier');
      expect(p).toHaveProperty('description');
      expect(p).toHaveProperty('coverage');
      expect(p.coverage).toHaveProperty('min');
      expect(p.coverage).toHaveProperty('max');
      expect(p).toHaveProperty('premiumRate');
      expect(p).toHaveProperty('createdAt');
      expect(p).toHaveProperty('updatedAt');
    }
  });
});
