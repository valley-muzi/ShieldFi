import { Router } from 'express';
import { postVerify1155 } from '../controllers/nft1155.controller.js';

const router = Router();
router.post('/verify-nft-1155', postVerify1155); // POST /api/verify-nft-1155
export default router;
