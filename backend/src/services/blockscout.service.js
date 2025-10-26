// services/blockscout.service.js
import 'dotenv/config';
const ROOT = process.env.BLOCKSCOUT_ROOT || 'https://eth-sepolia.blockscout.com'; // 세폴리아 네트워크 URL

// JSON 파싱 함수
async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text();
  try { return ct.includes('json') ? JSON.parse(txt) : { __nonjson: true, text: txt }; }
  catch { return { __nonjson: true, text: txt }; }
}

// 트랜잭션 정보 조회 (v2 -> v1 fallback)
export async function getTx(txHash) {
  const urlV2 = `${ROOT}/api/v2/transactions/${txHash}`;
  let res = await fetch(urlV2);
  let json = await safeJson(res);
  if (!json.__nonjson && json.hash) return { json, url: urlV2, api: 'v2' };

  const urlV1 = `${ROOT}/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`;
  res = await fetch(urlV1);
  json = await safeJson(res);
  return { json, url: urlV1, api: 'v1' };
}

// 블록 정보 조회
export async function getLatestBlockNumber() {
  const url = `${ROOT}/api/v2/blocks/latest`;
  const res = await fetch(url);
  const json = await safeJson(res);
  const num = json.number ?? json.block_number ?? null;
  return { num, url, raw: json };
}
