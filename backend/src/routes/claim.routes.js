@"
import { Router } from 'express';
const r = Router();
r.post('/', (req, res) => res.json({ ok: true, claimId: 'demo-1' }));
export default r;
"@ | Set-Content src/routes/claim.routes.js
