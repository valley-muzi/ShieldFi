// services/blockscout.service.js
import 'dotenv/config';
const ROOT = process.env.BLOCKSCOUT_ROOT || 'https://eth-sepolia.blockscout.com'; // ← /api 붙이지 않음

async function safeJson(res) {
  const ct = res.headers.get('content-type') || '';
  const txt = await res.text();
  try { return ct.includes('json') ? JSON.parse(txt) : { __nonjson: true, text: txt }; }
  catch { return { __nonjson: true, text: txt }; }
}

export async function getTx(txHash) {
  // v2 우선
  const urlV2 = `${ROOT}/api/v2/transactions/${txHash}`;
  let res = await fetch(urlV2);
  let json = await safeJson(res);
  if (!json.__nonjson && json.hash) return { json, url: urlV2, api: 'v2' };

  // v1(proxy) 폴백
  const urlV1 = `${ROOT}/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`;
  res = await fetch(urlV1);
  json = await safeJson(res);
  return { json, url: urlV1, api: 'v1' };
}

export async function getReceipt(txHash) {
  // v2는 별도 receipt 엔드포인트 없이 본문 내 success/receipt_status 등을 주는 인스턴스가 많음
  // 없으면 v1로 receipt 조회
  const urlV1 = `${ROOT}/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`;
  const res = await fetch(urlV1);
  const json = await safeJson(res);
  return { json, url: urlV1, api: 'v1' };
}

export async function getLatestBlockNumber() {
  // v2 최신 블록
  const url = `${ROOT}/api/v2/blocks/latest`;
  const res = await fetch(url);
  const json = await safeJson(res);
  // v2는 decimal block_number를 주는 경우가 일반적
  const num = json.number ?? json.block_number ?? null;
  return { num, url, raw: json };
}
