import { useState, useEffect } from "react";

interface UseBlockscoutTokenInfoProps {
  contractAddress: string;
  tokenId: string;
}

interface BlockscoutTokenResponse {
  type: string;
  token_id: string;
  token_type: string;
  token_name: string;
  token_symbol: string;
  total_supply: string;
  decimals: string;
}

interface BlockscoutTokenInstance {
  id: string;
  token_id: string;
  token_uri: string;
  metadata: Record<string, unknown>;
  token: {
    address_hash: string;
    name: string;
    symbol: string;
    type: string;
    holders_count: string;
    total_supply: string | null;
  };
  // 생성 시간 정보가 있다면 추가
  created_at?: string;
  block_timestamp?: string;
}

export function useBlockscoutTokenInfo({
  contractAddress,
  tokenId,
}: UseBlockscoutTokenInfoProps) {
  const [tokenInfo, setTokenInfo] = useState<BlockscoutTokenResponse | null>(
    null
  );
  const [tokenInstances, setTokenInstances] = useState<
    BlockscoutTokenInstance[]
  >([]);
  const [creationTimestamps, setCreationTimestamps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        // 1. 특정 토큰 ID의 정보 조회
        const tokenResponse = await fetch(
          `https://eth.blockscout.com/api/v2/tokens/${contractAddress}/instances/${tokenId}`
        );

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          setTokenInfo(tokenData);
        }

        // 2. 해당 컨트랙트의 모든 토큰 인스턴스 목록 조회
        const instancesResponse = await fetch(
          `https://eth.blockscout.com/api/v2/tokens/${contractAddress}/instances`
        );

        if (instancesResponse.ok) {
          const instancesData = await instancesResponse.json();
          setTokenInstances(instancesData.items || []);

          instancesData.items?.forEach((instance: BlockscoutTokenInstance) => {
            console.log(`토큰 ID ${instance.token_id}:`, {
              token_id: instance.token_id,
              token_uri: instance.token_uri,
              metadata: instance.metadata,
              token_info: instance.token,
            });
          });

          console.log(
            "보유자 수 (holders_count):",
            instancesData.items?.[0]?.token?.holders_count
          );

          // 모든 NFT의 생성 시간 수집
          console.log("=== NFT 생성 시간 수집 중 ===");
          const timestamps: string[] = [];

          // 간단한 접근: 컨트랙트의 전체 전송 히스토리에서 생성 시간 수집
          try {
            console.log("컨트랙트 전체 전송 히스토리 조회 중...");
            const contractTransfersResponse = await fetch(
              `https://eth.blockscout.com/api/v2/tokens/${contractAddress}/transfers`
            );

            if (contractTransfersResponse.ok) {
              const transfersData = await contractTransfersResponse.json();
              console.log("전송 히스토리 데이터:", transfersData);

              // 각 전송에서 생성 시간 수집 (처음 전송된 것들)
              const tokenIdSet = new Set<string>();
              transfersData.items?.forEach(
                (transfer: Record<string, unknown>) => {
                  const tokenId = String(transfer.token_id || "");
                  const timestamp = String(transfer.timestamp || "");

                  if (tokenId && !tokenIdSet.has(tokenId)) {
                    tokenIdSet.add(tokenId);
                    if (timestamp) {
                      timestamps.push(timestamp);
                      console.log(`토큰 ID ${tokenId} 생성 시간:`, timestamp);
                    }
                  }
                }
              );
            } else {
              console.log(
                "컨트랙트 전송 히스토리 조회 실패:",
                contractTransfersResponse.status
              );
            }
          } catch (err) {
            console.log("컨트랙트 전송 히스토리 조회 실패:", err);
          }

          setCreationTimestamps(timestamps);
        } else {
          setIsError(true);
          setError("토큰 인스턴스 정보를 찾을 수 없습니다");
        }
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setIsLoading(false);
      }
    };

    if (contractAddress && tokenId) {
      fetchTokenInfo();
    }
  }, [contractAddress, tokenId]);

  return {
    tokenInfo,
    totalSupply: tokenInfo?.total_supply,
    tokenInstances,
    totalInstances: tokenInstances.length,
    creationTimestamps,
    holdersCount: tokenInstances[0]?.token?.holders_count,
    isLoading,
    isError,
    error,
  };
}
