import { Router } from 'express';
import auth from './auth.routes.js';
import policy from './policy.routes.js';
import claim from './claim.routes.js';
import product from './product.routes.js';
import insuranceHistory from './insurance-history.routes.js';

const router = Router();
router.use('/auth', auth);
router.use('/policy', policy);
router.use('/claim', claim);
router.use('/products', product);
router.use('/insurance-history', insuranceHistory);

export default router;
