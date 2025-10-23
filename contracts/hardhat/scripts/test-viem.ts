// contracts/hardhat/scripts/test-viem.ts
import hre from "hardhat";

async function main() {
  console.log("hre.viem =", hre.viem ? "OK" : "undefined");
  const [wallet] = await hre.viem.getWalletClients();
  console.log("wallet =", wallet.account.address);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
