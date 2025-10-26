import { HardhatUserConfig, configVariable } from "hardhat/config";

// ✅ HH3 전용 플러그인들
import "@nomicfoundation/hardhat-ethers";                 // v4.x
import "@nomicfoundation/hardhat-ethers-chai-matchers";   // v3
import hardhatVerify from "@nomicfoundation/hardhat-verify"; // ← 변경점: default import

import "dotenv/config";

const config: HardhatUserConfig = {
  // ✅ HH3: 플러그인은 plugins 배열에 등록
  plugins: [hardhatVerify],

  solidity: {
    version: "0.8.29",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },

  paths: {
    sources: "src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    localhost: {
      type: "http",
      url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
      chainId: Number(process.env.LOCAL_CHAIN_ID || 31337),
      accounts: process.env.LOCAL_PRIVATE_KEY ? [process.env.LOCAL_PRIVATE_KEY] : "remote",
    },
    sepolia: {
      type: "http",
      url: configVariable("RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
      chainId: 11155111,
    },
    baseSepolia: {
      type: "http",
      url: configVariable("RPC_URL_BASE_SEPOLIA"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
      chainId: 84532,
    },
  },

  // ✅ HH3 스타일: verify.etherscan 로 설정 (Blockscout의 Etherscan 호환 API)
  verify: {
    etherscan: {
      apiKey: process.env.BLOCKSCOUT_API_KEY || "blockscout",
      customChains: [
        {
          network: "sepolia",
          chainId: 11155111,
          urls: {
            apiURL: "https://eth-sepolia.blockscout.com/api",
            browserURL: "https://eth-sepolia.blockscout.com",
          },
        },
        {
          network: "baseSepolia",
          chainId: 84532,
          urls: {
            apiURL: "https://base-sepolia.blockscout.com/api",
            browserURL: "https://base-sepolia.blockscout.com",
          },
        },
        {
          network: "base",
          chainId: 8453,
          urls: {
            apiURL: "https://base.blockscout.com/api",
            browserURL: "https://base.blockscout.com",
          },
        },
      ],
    },
  },
};

export default config;
