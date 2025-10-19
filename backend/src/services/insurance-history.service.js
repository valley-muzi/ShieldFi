/**
 * Insurance History Service
 * 
 * 보험 가입 이력을 조회하는 서비스입니다.
 * Blockscout API를 사용하여 온체인 NFT 가입 사실을 스캔합니다.
 * Story 2.2.1: 느린 검색 - `wallet_addr`와 `nft_addr`로 최초 가입 사실(`nft_token_id` 등) 조회
 */

/**
 * Blockscout API 설정을 가져옵니다.
 * - baseUrl: 환경변수 BLOCKSCOUT_URL (기본값: https://eth.blockscout.com)
 * - apiKey: 환경변수 BLOCKSCOUT_API_KEY (선택사항)
 */
function getBlockscoutConfig() {
  return {
    baseUrl: process.env.BLOCKSCOUT_URL || 'https://eth.blockscout.com',
    apiKey: process.env.BLOCKSCOUT_API_KEY || null
  };
}

/**
 * Blockscout 표준 응답 형태를 방어적으로 파싱합니다.
 */
function parseBlockscoutResponse(json) {
  if (!json) return { ok: false, error: 'Empty response' };
  if (json.status === '0') return { ok: false, error: json.message || 'Blockscout error' };
  if (!Array.isArray(json.result)) return { ok: false, error: 'Invalid result shape' };
  return { ok: true, result: json.result };
}

export class InsuranceHistoryService {
  /**
   * 사용자의 보험 가입 이력을 조회합니다.
   * Index-on-Read 패턴: DB에서 먼저 확인하고, 없으면 온체인에서 조회 후 DB에 저장
   * 
   * @param {Object} params
   * @param {string} params.walletAddr - 사용자 지갑 주소 (0x...)
   * @param {string} params.nftAddr - NFT 컨트랙트 주소 (0x...)
   * @returns {Promise<Array>} 보험 가입 이력 배열
   */
  static async getInsuranceHistory({ walletAddr, nftAddr }) {
    if (!walletAddr || !nftAddr) {
      throw new Error('walletAddr와 nftAddr는 필수입니다.');
    }

    try {
      // 1. INSURANCE_POLICY 테이블에서 사용자 지갑 주소와 NFT 주소로 데이터 확인
      const existingPolicy = await this.getPolicyFromDB({ walletAddr, nftAddr });
      
      if (existingPolicy) {
        // DB에 데이터가 있으면 바로 반환
        return await this.formatInsuranceHistory(existingPolicy);
      }

      // 2. DB에 없으면 온체인 검색 (Blockscout API)
      const onChainData = await this.searchOnChain({ walletAddr, nftAddr });
      
      if (!onChainData) {
        // 온체인에도 없으면 빈 배열 반환
        return [];
      }

      // 2-3. 온체인에서 찾은 데이터를 DB에 저장
      const savedPolicy = await this.savePolicyToDB(onChainData);

      // 3. 프론트에게 보험 가입 이력 정보 반환
      return await this.formatInsuranceHistory(savedPolicy);
    } catch (error) {
      console.error('[InsuranceHistoryService.getInsuranceHistory] Error:', error);
      throw new Error('보험 가입 이력 조회 실패');
    }
  }

  /**
   * DB에서 보험 정책 정보를 조회합니다.
   * @param {Object} params
   * @param {string} params.walletAddr - 사용자 지갑 주소
   * @param {string} params.nftAddr - NFT 컨트랙트 주소
   * @returns {Promise<Object|null>} 보험 정책 정보 또는 null
   */
  static async getPolicyFromDB({ walletAddr, nftAddr }) {
    // TODO: InsurancePolicyModel.getByWalletAndNft() 구현 필요
    // SELECT * FROM INSURANCE_POLICY 
    // WHERE user_wallet_addr = ? AND nft_contract_addr = ?
    console.log('[getPolicyFromDB] DB 조회 로직 구현 필요');
    return null;
  }

  /**
   * 온체인에서 보험 가입 정보를 검색합니다.
   * @param {Object} params
   * @param {string} params.walletAddr - 사용자 지갑 주소
   * @param {string} params.nftAddr - NFT 컨트랙트 주소
   * @returns {Promise<Object|null>} 온체인 데이터 또는 null
   */
  static async searchOnChain({ walletAddr, nftAddr }) {
    // 2-1. NFT 엔드포인트로 사용자 지갑에 해당 NFT가 있는지 확인
    const ownedNfts = await this.getOwnedNfts({ walletAddr });
    const targetNft = ownedNfts.find(nft => 
      nft.token.address_hash.toLowerCase() === nftAddr.toLowerCase()
    );
    
    if (!targetNft) {
      // 2-2. NFT가 없으면 null 반환
      return null;
    }

    // 2-2. NFT가 있으면 보험 가입 컨트랙트 정보 수집
    // TODO: 보험 가입 컨트랙트를 찾는 로직 구현 필요
    // - 사용자 지갑으로 보험 가입한 컨트랙트 찾기 (아직 미정)
    // - 보험 가입일, 보장 금액, 납부된 보험료 등 정보 수집
    
    return {
      user_wallet_addr: walletAddr,
      nft_contract_addr: nftAddr,
      nft_token_id: targetNft.id,
      // TODO: 아래 필드들은 온체인에서 조회 필요
      policy_start_date: new Date().toISOString(), // 보험 가입일
      policy_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년 후
      join_tx_hash: null, // 가입 트랜잭션 해시
      issue_tx_hash: null, // NFT 발급 트랜잭션 해시
      premium_paid: "0", // 납부된 보험료 (Wei 단위)
      product_id: 1 // 임시 상품 ID
    };
  }

  /**
   * 온체인 데이터를 DB에 저장합니다.
   * @param {Object} onChainData - 온체인에서 조회한 데이터
   * @returns {Promise<Object>} 저장된 보험 정책 정보
   */
  static async savePolicyToDB(onChainData) {
    // TODO: InsurancePolicyModel.create() 구현 필요
    // INSERT INTO INSURANCE_POLICY (...) VALUES (...)
    console.log('[savePolicyToDB] DB 저장 로직 구현 필요:', onChainData);
    return onChainData; // 임시로 온체인 데이터 반환
  }

  /**
   * 보험 정책 정보를 API 응답 형식으로 변환합니다.
   * @param {Object} policy - 보험 정책 정보
   * @returns {Promise<Array>} 포맷된 보험 이력 배열
   */
  static async formatInsuranceHistory(policy) {
    // TODO: ProductModel.getById()로 상품 정보 조회
    const product = {
      id: policy.product_id,
      name: "DeFi Protocol Hack Insurance", // 임시
      tier: "Premium", // 임시
      description: "DeFi 프로토콜 해킹 피해 발생 시 자산 손실의 최대 50%까지 보장하는 상품입니다." // 임시
    };

    // 보험 상태 결정 (1년 만료 체크)
    const startDate = new Date(policy.policy_start_date);
    const now = new Date();
    const oneYearLater = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    const insurance_status = now <= oneYearLater ? "ACTIVE" : "EXPIRED";

    // TODO: 지급 여부는 보험금 예치풀에서 사용자 지갑으로 보험금이 지급됐는지 
    // 블록스카우트 API를 통해 확인 (아직 미정, 어떤 엔드포인트로 쓸 건지도 미정)
    const is_paid = false; // 임시

    return [{
      product_id: product.id,
      product_name: product.name,
      product_tier: product.tier,
      description: product.description,
      start_date: policy.policy_start_date,
      insurance_status: insurance_status,
      is_paid: is_paid,
      coverage_amount_min: 0.1, // TODO: 상품 정보에서 조회
      coverage_amount_max: 1.0, // TODO: 상품 정보에서 조회
      coverage_amount: null, // TODO: 실제 지급 금액 조회
      premium_rate: 5, // TODO: 상품 정보에서 조회
      premium_paid: 0.1 // TODO: Wei 단위 변환 로직 필요
    }];
  }

  /**
   * 사용자가 소유한 NFT 목록을 조회합니다.
   * Blockscout API v2: GET /api/v2/addresses/{address_hash}/nft
   * 
   * @param {Object} params
   * @param {string} params.walletAddr - 사용자 지갑 주소 (0x...)
   * @returns {Promise<Array>} 소유한 NFT 목록
   */
  static async getOwnedNfts({ walletAddr }) {
    const config = getBlockscoutConfig();

    // Blockscout API v2: NFT 소유 목록 조회
    const url = new URL(`/api/v2/addresses/${walletAddr}/nft`, config.baseUrl);
    
    // API 키가 있으면 헤더에 추가
    const headers = {};
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    let json;
    try {
      const resp = await fetch(url.toString(), { headers });
      json = await resp.json();
    } catch (e) {
      throw new Error(`Blockscout API 호출 실패: ${e?.message ?? 'unknown error'}`);
    }

    // Blockscout v2 API 응답 형태: { items: [...], next_page_params: {...} }
    if (!json || !Array.isArray(json.items)) {
      return [];
    }

    return json.items;
  }

  /**
   * 지갑이 특정 NFT 컨트랙트에서 최초로 수령한 토큰의 tokenId를 조회합니다.
   * Blockscout API: module=account&action=tokennfttx (ERC-721/1155 전송 내역)
   * 
   * @deprecated 이 메서드는 더 이상 사용되지 않습니다. getOwnedNfts를 사용하세요.
   * @param {Object} params
   * @param {string} params.walletAddr - 사용자 지갑 주소 (0x...)
   * @param {string} params.nftAddr - NFT 컨트랙트 주소 (0x...)
   * @returns {Promise<{ tokenId: string | null, txHash: string | null, timestamp: string | null }>} 
   *          최초 수령 토큰 정보 (없으면 전부 null)
   */
  static async findFirstEnrollment({ walletAddr, nftAddr }) {
    const config = getBlockscoutConfig();

    // Blockscout: ERC721/1155 전송 기록 조회 API
    // page=1, offset=1, sort=asc 로 최초 전송 1건만 가져와 성능 최적화
    const url = new URL('/api', config.baseUrl);
    url.searchParams.set('module', 'account');
    url.searchParams.set('action', 'tokennfttx');
    url.searchParams.set('contractaddress', nftAddr);
    url.searchParams.set('address', walletAddr);
    url.searchParams.set('page', '1');
    url.searchParams.set('offset', '1');
    url.searchParams.set('sort', 'asc');
    
    // API 키가 있으면 헤더에 추가
    const headers = {};
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    let json;
    try {
      const resp = await fetch(url.toString(), { headers });
      json = await resp.json();
    } catch (e) {
      throw new Error(`Blockscout API 호출 실패: ${e?.message ?? 'unknown error'}`);
    }

    const parsed = parseBlockscoutResponse(json);
    if (!parsed.ok) {
      return { tokenId: null, txHash: null, timestamp: null };
    }

    if (parsed.result.length === 0) {
      return { tokenId: null, txHash: null, timestamp: null };
    }

    const first = parsed.result[0];
    // Blockscout tokennfttx 필드 예시: tokenID, hash, timeStamp 등
    const tokenId = first.tokenID ?? first.tokenId ?? null;
    const txHash = first.hash ?? first.txHash ?? null;
    const timestamp = first.timeStamp ? new Date(Number(first.timeStamp) * 1000).toISOString() : null;

    return { tokenId, txHash, timestamp };
  }


  /**
   * 임시 상품 데이터를 반환합니다.
   * 
   * ⚠️ 하드코딩된 데이터 위치: backend/src/services/insurance-history.service.js:189-210
   * 
   * TODO: 실제로는 데이터베이스에서 조회해야 함
   * - ProductModel.getAllProducts() 사용 예정
   * - 또는 별도의 보험 정책 테이블에서 조회
   * 
   * @returns {Promise<Array>} 상품 배열
   */
  static async getMockProducts() {
    // ⚠️ 하드코딩된 상품 데이터 시작
    return [
      {
        id: 100,
        name: "DeFi Protocol Hack Insurance",
        tier: "Premium",
        description: "DeFi 프로토콜 해킹 피해 발생 시 자산 손실의 최대 50%까지 보장하는 상품입니다."
      },
      {
        id: 101,
        name: "Smart Contract Failure Insurance",
        tier: "Basic",
        description: "스마트 컨트랙트 오류로 인한 자산 손실을 보장하는 기본 상품입니다."
      }
    ];
    // ⚠️ 하드코딩된 상품 데이터 끝
  }
}

/**
 * 사용 예시 (개발용):
 * 
 * import { InsuranceHistoryService } from './insurance-history.service.js';
 * 
 * // 보험 가입 이력 조회
 * const history = await InsuranceHistoryService.getInsuranceHistory({
 *   walletAddr: '0x4B0897b0513fdc7C541B6d9D7E929C4e5364D2dB',
 *   nftAddr: '0xabc1234fae5b0d9b0e9e3f1b9b5e8b9fce3a9d6c4f7c9a6b9a7a2b1c8d9e0f1'
 * });
 * 
 * console.log(history);
 * 
 * // NFT 소유 목록 조회
 * const ownedNfts = await InsuranceHistoryService.getOwnedNfts({
 *   walletAddr: '0x4B0897b0513fdc7C541B6d9D7E929C4e5364D2dB'
 * });
 * 
 * console.log(ownedNfts);
 */
