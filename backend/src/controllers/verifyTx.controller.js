// controllers/verifyTx.controller.js
import { getTx, getReceipt, getLatestBlockNumber } from '../services/blockscout.service.js';

export async function verifyTx(req, res) {
  try {
    const { txHash } = req.body;
    if (!txHash) return res.status(400).json({ ok:false, error:'MISSING_TX_HASH' });

    const { json: tx, url: urlTx, api } = await getTx(txHash);
    console.log('[verify-tx] urlTx=', urlTx, 'api=', api);

    // v2 형태: 존재 확인
    if (tx.__nonjson) return res.json({ ok:false, state:'UPSTREAM_NON_JSON', detail: tx.text?.slice(0,120) });
    // v2: hash 없으면 not found
    if (!tx.hash && !tx.result) return res.json({ ok:false, state:'TX_NOT_FOUND' });

    // 블록 포함 여부
    const blockNumber =
      tx.block_number ?? tx.number ?? (tx.result?.blockNumber ? parseInt(tx.result.blockNumber,16) : null);
    if (blockNumber == null) return res.json({ ok:false, state:'PENDING' });

    // 성공/실패 판정
    // v2에 success/receipt_status가 있으면 우선 사용, 없으면 v1 receipt로 판정
    let success = tx.success ?? (typeof tx.receipt_status !== 'undefined' ? tx.receipt_status === 1 : undefined);

    if (typeof success === 'undefined') {
      const { json: rc, url: urlRc } = await getReceipt(txHash);
      console.log('[verify-tx] urlRc=', urlRc);
      if (rc.__nonjson) return res.json({ ok:false, state:'UPSTREAM_NON_JSON', detail: rc.text?.slice(0,120) });
      if (!rc.result) return res.json({ ok:false, state:'NO_RECEIPT' });
      success = rc.result.status === '0x1';
    }

    // (옵션) 컨펌 수 계산
    const { num: latest } = await getLatestBlockNumber();
    const confirmations = latest && blockNumber ? (latest - blockNumber + 1) : null;

    return res.json({
      ok: !!success,
      state: success ? 'CONFIRMED_SUCCESS' : 'CONFIRMED_FAILED',
      blockNumber,
      confirmations
    });

  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
