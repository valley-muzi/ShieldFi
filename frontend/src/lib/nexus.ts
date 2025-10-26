import { NexusSDK } from '@avail-project/nexus-core';

export const nexusSDK = new NexusSDK({ network: 'testnet' });

 
// Thin wrapper that calls nexusSDK.isInitialized() from the SDK
export function isInitialized() {
    return nexusSDK.isInitialized();
  }
   
  export async function initializeWithProvider(provider: any) {
    if (!provider) throw new Error('No EIP-1193 provider (e.g., MetaMask) found');
    
    //If the SDK is already initialized, return
    if (nexusSDK.isInitialized()) return;
   
    //If the SDK is not initialized, initialize it with the provider passed as a parameter
    await nexusSDK.initialize(provider);
  }
   
  export async function deinit() {
    
    //If the SDK is not initialized, return
    if (!nexusSDK.isInitialized()) return;
   
    //If the SDK is initialized, de-initialize it
    await nexusSDK.deinit();
  }
   
  export async function getUnifiedBalances() {
   
    //Get the unified balances from the SDK
    return await nexusSDK.getUnifiedBalances();
  }