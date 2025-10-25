import { HardhatUserConfig, configVariable } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.29",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  // 프로젝트 실제 구조에 맞춘 경로
  paths: {
    sources: "src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    // ✅ 1) 로컬 개발용(하드햇 노드)
    localhost: {
      type: "http",
      url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
      chainId: Number(process.env.LOCAL_CHAIN_ID || 31337),
      // 로컬은 프라이빗키 없어도 하드햇 노드의 언락 계정으로 동작 가능
      // 넣고 싶으면 .env에 LOCAL_PRIVATE_KEY=0x... 추가
      accounts: process.env.LOCAL_PRIVATE_KEY
        ? [process.env.LOCAL_PRIVATE_KEY]
        : "remote",
    },

    // ✅ 2) Sepolia (Blockscout 사용)
    sepolia: {
      type: "http",
      url: configVariable("RPC_URL"), // .env: RPC_URL=https://...
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")], // .env: SEPOLIA_PRIVATE_KEY=0x...
      chainId: 11155111,
    },

    // ✅ 3) Base Sepolia (필요 시)
    baseSepolia: {
      type: "http",
      url: configVariable("RPC_URL_BASE_SEPOLIA"), // .env: RPC_URL_BASE_SEPOLIA=https://...
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
      chainId: 84532,
    },
  },

  // Blockscout(Etherscan 호환) 검증 설정
  etherscan: {
    apiKey: {
      sepolia: process.env.BLOCKSCOUT_API_KEY || "blockscout",
      baseSepolia: process.env.BLOCKSCOUT_API_KEY || "blockscout",
      base: process.env.BLOCKSCOUT_API_KEY || "blockscout",
    },
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
};

export default config;

