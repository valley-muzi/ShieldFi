// hardhat/scripts/deploy.ts
import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

function saveAddresses(net: string, data: Record<string, any>) {
  const dir = path.join(process.cwd(), "..", "deployments", net);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "addresses.json");
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  const merged = { ...prev, ...data };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2));
  console.log(`[write] ${path.relative(process.cwd(), file)}`);
}

async function main() {
  const network = hre.network.name;

  const viem = (hre as any).viem; // 타입오류 방지용
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  console.log(`network=${network}`);
  console.log(`deployer=${deployer.account.address}`);

  // 1) Deploy contracts
  const policyNFT = await viem.deployContract("core/PolicyNFT.sol:PolicyNFT", [deployer.account.address]);
  const insurance = await viem.deployContract("core/Insurance.sol:Insurance", [deployer.account.address]);
  const lifecycle = await viem.deployContract("core/PolicyLifecycle.sol:PolicyLifecycle", [deployer.account.address]);
  const treasury = await viem.deployContract("core/Treasury.sol:Treasury", [deployer.account.address]);
  const payout = await viem.deployContract("core/Payout.sol:Payout", [deployer.account.address]);

  console.log("PolicyNFT =", policyNFT.address);
  console.log("Insurance =", insurance.address);
  console.log("Lifecycle =", lifecycle.address);
  console.log("Treasury  =", treasury.address);
  console.log("Payout    =", payout.address);

  // 2) Wiring
  const PolicyNFT = await viem.getContractAt("core/PolicyNFT.sol:PolicyNFT", policyNFT.address);
  const Insurance = await viem.getContractAt("core/Insurance.sol:Insurance", insurance.address);
  const Lifecycle = await viem.getContractAt("core/PolicyLifecycle.sol:PolicyLifecycle", lifecycle.address);
  const Treasury  = await viem.getContractAt("core/Treasury.sol:Treasury", treasury.address);
  const Payout    = await viem.getContractAt("core/Payout.sol:Payout", payout.address);

  await Insurance.write.setPolicyNFT([policyNFT.address]);
  await Lifecycle.write.setAddresses([insurance.address, policyNFT.address, treasury.address]);
  await Payout.write.setAddresses([insurance.address, policyNFT.address, treasury.address]);

  await PolicyNFT.write.setController([insurance.address, true]);
  await PolicyNFT.write.setController([lifecycle.address, true]);
  await PolicyNFT.write.setController([payout.address, true]);

  await Treasury.write.setController([lifecycle.address, true]);
  await Treasury.write.setController([payout.address, true]);

  saveAddresses(network, {
    PolicyNFT: policyNFT.address,
    Insurance: insurance.address,
    PolicyLifecycle: lifecycle.address,
    Treasury: treasury.address,
    Payout: payout.address,
    deployedAt: new Date().toISOString()
  });

  console.log("✅ deploy + wiring done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


