@"
import Web3 from 'web3';
import { env } from './env.js';

export const web3 = env.RPC_URL ? new Web3(env.RPC_URL) : null;

export const makeAccount = () => {
  if (!web3 || !env.WALLET_PK) return null;
  return web3.eth.accounts.privateKeyToAccount(env.WALLET_PK);
};
"@ | Set-Content src/config/web3.config.js
