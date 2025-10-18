@"
import { Router } from 'express';
import auth from './auth.routes.js';
import policy from './policy.routes.js';
import claim from './claim.routes.js';

const router = Router();
router.use('/auth', auth);
router.use('/policy', policy);
router.use('/claim', claim);

export default router;
"@ | Set-Content src/routes/index.js
