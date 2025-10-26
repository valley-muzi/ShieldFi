const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

// ESM(모듈) 파일을 CommonJS에서 쓰기: 동적 import
async function getClaimService() {
  // 🔥 프로젝트 구조에 맞춰 경로 수정
  const mod = await import('./src/services/claim.service.js');
  // claim.service.js가 default export(싱글톤) 형태면 아래처럼
  return mod.default || mod;
}

const app = express();
app.use(express.json());

// 헬스체크
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// payout 실행: approveAndPay(policyId, beneficiary, amountWei)
app.post('/claims/payout', async (req, res) => {
  try {
    const { policyId, beneficiary, amountWei } = req.body || {};

    if (policyId === undefined || policyId === null)
      return res.status(400).json({ ok:false, error:'policyId가 필요합니다.' });
    if (!/^0x[a-fA-F0-9]{40}$/.test(beneficiary || ''))
      return res.status(400).json({ ok:false, error:'beneficiary(주소) 형식이 올바르지 않습니다.' });
    if (!/^\d+$/.test(amountWei || ''))
      return res.status(400).json({ ok:false, error:'amountWei(Wei 정수 문자열)가 필요합니다.' });

    const claimService = await getClaimService();
    const out = await claimService.executeApproveAndPay(policyId, beneficiary, amountWei);
    return res.json({ ok:true, ...out });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e?.message || '알 수 없는 오류' });
  }
});

// 포트는 .env의 PORT, 없으면 4000 사용
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Payout server running on http://localhost:${PORT}`));
