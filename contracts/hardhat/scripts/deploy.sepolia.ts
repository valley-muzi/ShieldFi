// scripts/deploy.sepolia.ts
import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---- ENV (Sepolia) ----
const RPC_URL  = process.env.RPC_URL!;
const PKEY     = process.env.SEPOLIA_PRIVATE_KEY!;
const CHAIN_ID = 11155111;

// 의존 컨트랙트 주소: 있으면 그대로 사용, 없으면 이 스크립트가 먼저 배포
let TREASURY_ADDR   = process.env.SEPOLIA_TREASURY_ADDR;
let POLICYNFT_ADDR  = process.env.SEPOLIA_POLICYNFT_ADDR;

// ---- Artifacts (네 디렉토리 구조 기준: hardhat/src/core/*.sol) ----
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
  if (name === "Treasury"  && TREASURY_ADDR)  return TREASURY_ADDR;
  if (name === "PolicyNFT" && POLICYNFT_ADDR) return POLICYNFT_ADDR;

  const { abi, bytecode } = loadArtifact(artifactPath);
  const factory  = new ContractFactory(abi, bytecode, wallet);

  const ctor = (abi as any[]).find((x) => x.type === "constructor");
  const inputs: any[] = ctor?.inputs ?? [];

  // 기본 args (필요 시 프로젝트에 맞게 커스텀)
  let args: any[] = [];

  // PolicyNFT가 (name, symbol) 2개 string 받는 일반 ERC721 패턴이면 기본값 제공
  const isTwoStrings = inputs.length === 2 && inputs[0]?.type === "string" && inputs[1]?.type === "string";
  if (name === "PolicyNFT" && isTwoStrings) {
    args = ["ShieldFi Policy", "SPOL"];
  } else if (inputs.length > 0) {
    throw new Error(
      `[deploy] ${name} requires constructor args: ${JSON.stringify(inputs)}\n` +
      `> 대안1) .env에 기존 주소 입력 (SEPOLIA_${name.toUpperCase()}_ADDR)\n` +
      `> 대안2) 스크립트 내 args를 프로젝트에 맞게 채워주세요.`
    );
  }

  const contract = await factory.deploy(...args);
  await contract.waitForDeployment();
  const dtx = contract.deploymentTransaction();
  if (dtx) await wallet.provider!.waitForTransaction(dtx.hash);

  const addr = await contract.getAddress();
  console.log(`[deploy] ${name}.address =`, addr);

  if (name === "Treasury")   TREASURY_ADDR  = addr;
  if (name === "PolicyNFT")  POLICYNFT_ADDR = addr;

  return addr;
}

async function main() {
  if (!RPC_URL) throw new Error("RPC_URL is empty in .env");
  if (!PKEY)    throw new Error("SEPOLIA_PRIVATE_KEY is empty in .env");

  const provider = new JsonRpcProvider(RPC_URL, { chainId: CHAIN_ID, name: "sepolia" });
  const wallet   = new Wallet(PKEY, provider);
  const deployer = await wallet.getAddress();

  console.log("[deploy] network   =", await provider.getNetwork());
  console.log("[deploy] deployer  =", deployer);
  console.log("[deploy] balance   =", (await provider.getBalance(deployer)).toString(), "wei");

  // 1) 의존 컨트랙트 확보
  await deployIfNeeded("Treasury",  ART_TREASURY,  wallet);
  await deployIfNeeded("PolicyNFT", ART_POLICYNFT, wallet);

  // 2) Insurance 배포 (constructor: treasury_, policyNFT_)
  const insArt = loadArtifact(ART_INSURANCE);
  const InsuranceFactory = new ContractFactory(insArt.abi, insArt.bytecode, wallet);

  const insurance = await InsuranceFactory.deploy(TREASURY_ADDR!, POLICYNFT_ADDR!);
  await insurance.waitForDeployment();
  const itx = insurance.deploymentTransaction();
  if (itx) await wallet.provider!.waitForTransaction(itx.hash);

  const insAddr = await insurance.getAddress();
  console.log("[deploy] Insurance.address =", insAddr);
  if (itx) console.log("[deploy] Insurance.txHash  =", itx.hash);

  // 3) 결과 저장
  const outDir = resolve(__dirname, "../deployments");
  mkdirSync(outDir, { recursive: true });

  const outJsonPath = join(outDir, "sepolia.json");
  const outJson = {
    chainId: CHAIN_ID,
    rpc: RPC_URL,
    contracts: {
      Treasury:  { address: TREASURY_ADDR },
      PolicyNFT: { address: POLICYNFT_ADDR },
      Insurance: { address: insAddr },
    },
  };
  writeFileSync(outJsonPath, JSON.stringify(outJson, null, 2));

  // ABI 내보내기 (프론트/백엔드 공용)
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
