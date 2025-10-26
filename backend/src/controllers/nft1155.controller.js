import { verify1155Owned } from '../services/nft1155.service.js';

export async function postVerify1155(req, res) {
  try {
    const { wallet_addr, nft_addr, nft_id} = req.body;

    if (!wallet_addr || !nft_addr || typeof nft_id === 'undefined') {
      return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
    }

    const tokenId = BigInt(nft_id);

    const result = await verify1155Owned({
      wallet: wallet_addr,
      nftAddress: nft_addr,
      tokenId
    });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
