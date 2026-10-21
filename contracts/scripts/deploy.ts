import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("=================================================");
  console.log("TrustID India — Smart Contract Deployment Script");
  console.log("=================================================");

  const [deployer, universityAccount1, universityAccount2] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Initial balance: ${(await ethers.provider.getBalance(deployer.address)).toString()} wei`);

  // 1. Deploy IssuerRegistry
  console.log("\n1. Deploying IssuerRegistry...");
  const IssuerRegistryFactory = await ethers.getContractFactory("IssuerRegistry");
  const issuerRegistry = await IssuerRegistryFactory.deploy();
  await issuerRegistry.waitForDeployment();
  const issuerRegistryAddress = await issuerRegistry.getAddress();
  console.log(`✓ IssuerRegistry deployed at: ${issuerRegistryAddress}`);

  // 2. Deploy CredentialStatusRegistry
  console.log("\n2. Deploying CredentialStatusRegistry...");
  const CredentialStatusRegistryFactory = await ethers.getContractFactory("CredentialStatusRegistry");
  const statusRegistry = await CredentialStatusRegistryFactory.deploy(issuerRegistryAddress);
  await statusRegistry.waitForDeployment();
  const statusRegistryAddress = await statusRegistry.getAddress();
  console.log(`✓ CredentialStatusRegistry deployed at: ${statusRegistryAddress}`);

  // 3. Seed Default Demonstration Issuers
  console.log("\n3. Seeding Demo University Issuers...");

  // Primary demo issuer (Hardhat Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
  const tx1 = await issuerRegistry.registerIssuer(
    universityAccount1.address,
    "Indian Institute of Technology Bombay — DEMO",
    "https://www.iitb.ac.in/academic-demo",
    true
  );
  await tx1.wait();
  console.log(`✓ Registered Issuer: IIT Bombay (${universityAccount1.address})`);

  // Secondary demo issuer (Hardhat Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC)
  const tx2 = await issuerRegistry.registerIssuer(
    universityAccount2.address,
    "National Institute of Technology Karnataka — DEMO",
    "https://www.nitk.ac.in/academic-demo",
    true
  );
  await tx2.wait();
  console.log(`✓ Registered Issuer: NIT Karnataka (${universityAccount2.address})`);

  // Also register deployer as an authorized demo issuer for testing convenience
  const tx3 = await issuerRegistry.registerIssuer(
    deployer.address,
    "TrustID National Academic Governance Authority — DEMO",
    "https://trustid.gov.in/demo",
    true
  );
  await tx3.wait();
  console.log(`✓ Registered Issuer: National Governance Authority (${deployer.address})`);

  // 4. Export Contract Addresses & ABIs for Frontend and Backend
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const issuerRegistryArtifact = await import("../artifacts/contracts/IssuerRegistry.sol/IssuerRegistry.json");
  const statusRegistryArtifact = await import("../artifacts/contracts/CredentialStatusRegistry.sol/CredentialStatusRegistry.json");

  const contractDeploymentInfo = {
    network: {
      name: network.name,
      chainId: chainId,
      rpcUrl: "http://127.0.0.1:8545",
    },
    contracts: {
      IssuerRegistry: {
        address: issuerRegistryAddress,
        abi: issuerRegistryArtifact.abi,
      },
      CredentialStatusRegistry: {
        address: statusRegistryAddress,
        abi: statusRegistryArtifact.abi,
      },
    },
    demoAccounts: {
      governanceAdmin: deployer.address,
      universityIssuer1: universityAccount1.address,
      universityIssuer2: universityAccount2.address,
    },
    deployedAt: new Date().toISOString(),
  };

  const targets = [
    path.join(__dirname, "../../backend/src/config/contracts.json"),
    path.join(__dirname, "../../frontend/src/config/contracts.json"),
    path.join(__dirname, "../deployed-contracts.json"),
  ];

  for (const targetPath of targets) {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(contractDeploymentInfo, null, 2));
    console.log(`✓ Exported deployment config to: ${targetPath}`);
  }

  console.log("\n=================================================");
  console.log("Deployment and Demo Seeding Successfully Completed!");
  console.log("=================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
