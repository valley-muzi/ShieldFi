import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ProductService } from '../services/product.service.js';
import { ProductModel } from '../models/product.model.js';
import { pool } from '../config/db.config.js';

/**
 * Product Service Tests
 */
describe('Product Service', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    await pool.connect();
  });

  afterAll(async () => {
    // Close database connection
    await pool.end();
  });

  describe('getAllProducts', () => {
    it('should return all products with success status', async () => {
      const result = await ProductService.getAllProducts();
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('count');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return products with correct structure', async () => {
      const result = await ProductService.getAllProducts();
      
      if (result.data.length > 0) {
        const product = result.data[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('tier');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('coverage');
        expect(product).toHaveProperty('premiumRate');
        expect(product).toHaveProperty('createdAt');
        expect(product).toHaveProperty('updatedAt');
        
        expect(product.coverage).toHaveProperty('min');
        expect(product.coverage).toHaveProperty('max');
      }
    });
  });


});

/**
 * Product Model Tests
 */
describe('Product Model', () => {
  beforeAll(async () => {
    await pool.connect();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('getAllProducts', () => {
    it('should return array of products', async () => {
      const products = await ProductModel.getAllProducts();
      
      expect(Array.isArray(products)).toBe(true);
      
      if (products.length > 0) {
        const product = products[0];
        expect(product).toHaveProperty('product_id');
        expect(product).toHaveProperty('product_name');
        expect(product).toHaveProperty('tier');
        expect(product).toHaveProperty('coverage_amount_min');
        expect(product).toHaveProperty('coverage_amount_max');
        expect(product).toHaveProperty('premium_rate');
      }
    });
  });

});
