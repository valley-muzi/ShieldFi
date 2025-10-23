import "@nomicfoundation/hardhat-viem";  
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
dotenv.config();

export default {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  paths: {
    // ★ 소스는 하드햇 프로젝트 "내부"의 링크 디렉토리로 지정
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: { type: "edr-simulated" },
    ...(process.env.SEPOLIA_RPC_URL
      ? {
          sepolia: {
            type: "http",
            url: process.env.SEPOLIA_RPC_URL,
            accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
          },
        }
      : {}),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};