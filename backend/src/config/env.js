@"
import dotenv from 'dotenv';
dotenv.config();
export const env = {
  PORT: process.env.PORT ?? '4000',
  MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/shieldfi',
  RPC_URL: process.env.RPC_URL ?? '',
  CHAIN_ID: Number(process.env.CHAIN_ID ?? 0),
  WALLET_PK: process.env.WALLET_PK ?? '',
  POLICY_CONTRACT: process.env.POLICY_CONTRACT ?? '',
  CLAIM_CONTRACT: process.env.CLAIM_CONTRACT ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret',
};
"@ | Set-Content src/config/env.js
