// point : 검증 스크립트임. 주소 JSON을 읽어 일괄  검증용. `deployments/<network>/addresses.json`을 읽어 존재하는 주소만 검증 시도, 생성자 인자 필요한 컨트랙트는 `ctorArgs` 맵으로 관리
import { hre } from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
const net = await hre.network.getNetworkName();
const file = path.join(process.cwd(), "..", "deployments", net, "addresses.json");
if (!fs.existsSync(file)) {
console.log(`[warn] addresses file not found: ${file}`);
return;
}
const addrs = JSON.parse(fs.readFileSync(file, "utf8"));

// 생성자 인자 필요시 여기에 등록
const ctorArgs: Record<string, any[]> = {
// e.g. Payout: [ addrs.Treasury ],
};

for (const key of ["Insurance", "Treasury", "PolicyNFT", "Payout"]) {
const addr = addrs[key];
if (!addr) continue;
try {
console.log(`verify ${key} at ${addr}`);
await hre.run("verify:verify", {
address: addr,
constructorArguments: ctorArgs[key] || [],
});
} catch (e: any) {
const msg = String(e?.message || e);
if (msg.includes("Already Verified")) {
console.log(`[ok] ${key} already verified`);
} else {
console.log(`[warn] ${key} verify failed: ${msg}`);
}
}
}
}

main().catch((e) => {
console.error(e);
process.exit(1);
});
