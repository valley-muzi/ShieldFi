// scripts/deploy.local.ts
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---- ENV ----
const RPC_URL   = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
const PKEY      = process.env.LOCAL_PRIVATE_KEY;
const CHAIN_ID  = Number(process.env.LOCAL_CHAIN_ID || 31337);

// 이미 배포해둔 주소가 있으면 사용(.env), 없으면 이 스크립트가 먼저 배포
let TREASURY_ADDR    = process.env.LOCAL_TREASURY_ADDR;
let POLICY_NFT_ADDR  = process.env.LOCAL_POLICYNFT_ADDR;

// ---- Artifacts (네 폴더 구조: hardhat/src/core/*.sol) ----
const ART_INSURANCE = resolve(__dirname, "../artifacts/src/core/Insurance.sol/Insurance.json");
const ART_TREASURY  = resolve(__dirname, "../artifacts/src/core/Treasury.sol/Treasury.json");
const ART_POLICYNFT = resolve(__dirname, "../artifacts/src/core/PolicyNFT.sol/PolicyNFT.json");

function loadArtifact(p: string) {
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (!j.abi || !j.bytecode) throw new Error(`Artifact missing abi/bytecode: ${p}`);
  return { abi: j.abi, bytecode: j.bytecode };
}

async function deployIfNeeded(
  name: "Treasury" | "PolicyNFT",
  artifactPath: string,
  wallet: Wallet
): Promise<string> {
  if (name === "Treasury"  && TREASURY_ADDR)   return TREASURY_ADDR;
  if (name === "PolicyNFT" && POLICY_NFT_ADDR) return POLICY_NFT_ADDR;

  const { abi, bytecode } = loadArtifact(artifactPath);
  const factory  = new ContractFactory(abi, bytecode, wallet);

  const ctor = (abi as any[]).find((x) => x.type === "constructor");
  const inputs: any[] = ctor?.inputs ?? [];

  // 기본적으로 인자 없이 배포. 필요 시 감지해서 기본값 제공 (프로젝트에 맞게 수정 가능)
  let args: any[] = [];
  const isTwoStrings =
    inputs.length === 2 && inputs[0]?.type === "string" && inputs[1]?.type === "string";

  if (name === "PolicyNFT" && isTwoStrings) {
    // 예: ERC721 name, symbol
    args = ["ShieldFi Policy", "SPOL"];
  } else if (inputs.length > 0) {
    throw new Error(
      `[deploy] ${name} requires constructor args: ${JSON.stringify(inputs)}\n` +
      `> 대안1) .env에 기존 주소 입력 (LOCAL_${name.toUpperCase()}_ADDR)\n` +
      `> 대안2) 아래 args를 프로젝트에 맞게 채우세요.`
    );
  }

  // 배포 → 확정 대기(논스 충돌 방지)
  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const dtx = contract.deploymentTransaction();
  if (dtx) await wallet.provider!.waitForTransaction(dtx.hash);

  const addr = await contract.getAddress();
  console.log(`[deploy] ${name}.address =`, addr);
  return addr;
}

async function main() {
  if (!PKEY) throw new Error("LOCAL_PRIVATE_KEY is empty. Put one from `npx hardhat node` into .env");

  const provider = new JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: "localhost" });
  const wallet   = new Wallet(PKEY, provider);

  console.log("[deploy] network =", await provider.getNetwork());

  // 1) 의존 컨트랙트 확보 (있으면 사용, 없으면 먼저 배포)
  TREASURY_ADDR   = await deployIfNeeded("Treasury",  ART_TREASURY,  wallet);
  POLICY_NFT_ADDR = await deployIfNeeded("PolicyNFT", ART_POLICYNFT, wallet);

  // 2) Insurance 배포 (constructor: treasury_, policyNFT_)
  const insArt = loadArtifact(ART_INSURANCE);
  const InsuranceFactory = new ContractFactory(insArt.abi, insArt.bytecode, wallet);

  const insurance = await InsuranceFactory.deploy(TREASURY_ADDR!, POLICY_NFT_ADDR!);
  await insurance.waitForDeployment();
  const itx = insurance.deploymentTransaction();
  if (itx) await wallet.provider!.waitForTransaction(itx.hash);

  const insAddr = await insurance.getAddress();
  console.log("[deploy] Insurance.address =", insAddr);
  if (itx) console.log("[deploy] Insurance.txHash  =", itx.hash);

  // 3) 결과 저장 (프론트/백엔드 공용)
  const outDir = resolve(__dirname, "../deployments");
  mkdirSync(outDir, { recursive: true });

  const outJsonPath = join(outDir, "localhost.json");
  const outJson = {
    chainId: CHAIN_ID,
    rpc: RPC_URL,
    contracts: {
      Treasury:  { address: TREASURY_ADDR },
      PolicyNFT: { address: POLICY_NFT_ADDR },
      Insurance: { address: insAddr },
    },
  };
  writeFileSync(outJsonPath, JSON.stringify(outJson, null, 2));

  const abiDir = join(outDir, "abi");
  mkdirSync(abiDir, { recursive: true });
  writeFileSync(join(abiDir, "Treasury.json"),  JSON.stringify(loadArtifact(ART_TREASURY).abi, null, 2));
  writeFileSync(join(abiDir, "PolicyNFT.json"), JSON.stringify(loadArtifact(ART_POLICYNFT).abi, null, 2));
  writeFileSync(join(abiDir, "Insurance.json"), JSON.stringify(insArt.abi, null, 2));

  console.log("[deploy] wrote:", outJsonPath);
  console.log("[deploy] wrote:", join(abiDir, "Treasury.json"));
  console.log("[deploy] wrote:", join(abiDir, "PolicyNFT.json"));
  console.log("[deploy] wrote:", join(abiDir, "Insurance.json"));
  console.log("[done]");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

