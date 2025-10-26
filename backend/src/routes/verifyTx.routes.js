// src/routes/verifyTx.route.js
import { Router } from 'express';
import { verifyTx } from '../controllers/verifyTx.controller.js';

const router = Router();

// POST /api/verify-tx
router.post('/verify-tx', verifyTx);

export default router;
