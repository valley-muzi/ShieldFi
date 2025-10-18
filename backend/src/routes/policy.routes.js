@"
import { Router } from 'express';
const r = Router();
r.get('/', (_req, res) => res.json({ ok: true, items: [] }));
export default r;
"@ | Set-Content src/routes/policy.routes.js
