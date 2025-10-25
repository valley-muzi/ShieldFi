import { run, network } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const root = join(__dirname, "..", "..");
  const file = join(root, "deployments", network.name, "addresses.json");
  const addrs = JSON.parse(readFileSync(file, "utf8"));

  console.log(`[verify] network=${network.name}`);
  await run("verify:verify", { address: addrs.ShieldFi.Treasury, constructorArguments: [] });
  await run("verify:verify", { address: addrs.ShieldFi.PolicyNFT, constructorArguments: ["ShieldFi Policy", "SFP"] });
  await run("verify:verify", { address: addrs.ShieldFi.Insurance, constructorArguments: [addrs.ShieldFi.Treasury, addrs.ShieldFi.PolicyNFT] });
  await run("verify:verify", { address: addrs.ShieldFi.Payout, constructorArguments: [addrs.ShieldFi.Treasury] });

  console.log("[verify] done (Blockscout)");
}

main().catch((e) => { console.error(e); process.exit(1); });
