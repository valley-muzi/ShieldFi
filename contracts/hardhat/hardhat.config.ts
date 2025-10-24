import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
dotenv.config();

const networks: HardhatUserConfig["networks"] = {
// 로컬 개발/리허설, 하드햇 최소 설정 배포및검증전용
hardhat: { type: "edr-simulated" },
};

// 데모/대외 시연 직전 .env 채우면 자동 활성화
if (process.env.SEPOLIA_RPC_URL) {
networks!.sepolia = {
type: "http",
url: process.env.SEPOLIA_RPC_URL!,
accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
};
}

const config: HardhatUserConfig = {
solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
paths: {
sources: "../smartsorce",       // Foundry/Hardhat 공용 소스
tests: "./test",
cache: "./cache",
artifacts: "./artifacts",
},
networks,
etherscan: {
// 필요 시 .env: ETHERSCAN_API_KEY=xxxxx  또는 { sepolia: "xxxxx" }
apiKey: process.env.ETHERSCAN_API_KEY || "",
},
};

export default config;

