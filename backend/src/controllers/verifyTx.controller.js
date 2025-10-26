// controllers/verifyTx.controller.js
import { getTx} from '../services/blockscout.service.js';

export async function verifyTx(req, res) {
  try {
    const { txHash } = req.body;
    if (!txHash) return res.status(400).json({ ok: false, error: '올바르지 않은 트랜잭션 요청입니다' });

    const { json: tx, url: urlTx, api } = await getTx(txHash);
    console.log('[verify-tx] urlTx=', urlTx, 'api=', api);

    // v2 형태: 존재 확인
    if (tx.__nonjson) return res.json({ ok: false, state: 'UPSTREAM_NON_JSON', detail: tx.text?.slice(0, 120) });
    // v2: hash 없으면 not found
    if (!tx.hash && !tx.result) return res.json({ ok: false, state: 'TX_NOT_FOUND' });

    // 블록 포함 여부
    const blockNumber =
      tx.block_number ?? tx.number ?? (tx.result?.blockNumber ? parseInt(tx.result.blockNumber, 16) : null);
    if (blockNumber == null) return res.json({ ok: false, state: 'PENDING' });

    // 트랜잭션 성공/실패 확인
    const success = tx.status === 'ok'; // 트랜잭션 상태가 ok이면 성공으로 판단

    // 성공 여부에 따른 상태 반환
    return res.json({
      ok: success,
      state: success ? 'CONFIRMED_SUCCESS' : 'CONFIRMED_FAILED',
      blockNumber,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
