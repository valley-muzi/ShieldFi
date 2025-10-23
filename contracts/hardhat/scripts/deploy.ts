// point: 이 스크립트는 컨트렉트가 실제로 생겼을 때 자동 인식돼서 배포함. 현재는 “스켈레톤만 존재”하므로, 아티팩트가 없으면 해당 컨트랙트는 skip으로 넘어감. 따라서 나중에 구현하고 컴파일하면 자동 배포 대상에 포함하도록 함. 
import { hre } from "hardhat";
import fs from "node:fs";
import path from "node:path";

type Maybe<T> = T | null;

async function tryDeploy(name: string, args: any[] = []): Promise<Maybe<`0x${string}`>> {
try {
const c = await hre.viem.deployContract(name, args);
return c.address as `0x${string}`;
} catch (e: any) {
if (String(e?.message || e).includes("Artifact for contract")) {
console.log(`[skip] ${name} artifact not found. (compile later)`);
return null;
}
throw e;
}
}

function saveAddresses(network: string, data: Record<string, any>) {
const dir = path.join(process.cwd(), "..", "deployments", network);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "addresses.json");
let prev: any = {};
if (fs.existsSync(file)) prev = JSON.parse(fs.readFileSync(file, "utf8"));
const merged = { ...prev, ...data };
fs.writeFileSync(file, JSON.stringify(merged, null, 2));
console.log(`[write] ${path.relative(process.cwd(), file)}`);
}

async function main() {
const net = await hre.network.getNetworkName();   // "hardhat" | "sepolia" 
const [deployer] = await hre.viem.getWalletClients();
console.log(`network=${net}`);
console.log(`deployer=${deployer.account.address}`);
//Insurance → Treasury→PolicyNFT→Patout 순으로 배포후, 결과를 `deployments/<network>/addresses.json`에 병합 저장

// 1) Insurance
const insurance = await tryDeploy("core/Insurance.sol:Insurance", []);
if (insurance) console.log(`Insurance=${insurance}`);

// 2) Treasury
const treasury = await tryDeploy("core/Treasury.sol:Treasury", []);
if (treasury) console.log(`Treasury=${treasury}`);

// 3) PolicyNFT
const policyNFT = await tryDeploy("core/PolicyNFT.sol:PolicyNFT", []);
if (policyNFT) console.log(`PolicyNFT=${policyNFT}`);

// 4) Payout (예: Treasury 주소 주입)
const payoutArgs = treasury ? [treasury] : [];
const payout = await tryDeploy("core/Payout.sol:Payout", payoutArgs);
if (payout) console.log(`Payout=${payout}`);

saveAddresses(net, {
Insurance: insurance,
Treasury: treasury,
PolicyNFT: policyNFT,
Payout: payout,
deployedAt: new Date().toISOString(),
});
}

main().catch((e) => {
console.error(e);
process.exit(1);
});
