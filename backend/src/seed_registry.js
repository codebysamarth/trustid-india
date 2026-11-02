const { ethers } = require('ethers');
const contracts = require('../../frontend/src/config/contracts.json');
const fs = require('fs');
const path = require('path');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const statusAddress = contracts.contracts.CredentialStatusRegistry.address;
  const statusContract = new ethers.Contract(statusAddress, contracts.contracts.CredentialStatusRegistry.abi, provider);

  const ownerSigner = await provider.getSigner(0); // Account #0 (Deployer / Owner)
  console.log('Using Owner Signer:', await ownerSigner.getAddress());

  // Also authorize Account #0 as issuer if needed
  const issuerAddress = contracts.contracts.IssuerRegistry.address;
  const issuerContract = new ethers.Contract(issuerAddress, contracts.contracts.IssuerRegistry.abi, ownerSigner);
  const isAuth = await issuerContract.isIssuerAuthorized(await ownerSigner.getAddress());
  if (!isAuth) {
    console.log('Authorizing owner in IssuerRegistry...');
    const tx = await issuerContract.registerIssuer(
      await ownerSigner.getAddress(),
      'Consortium Governance Authority',
      'https://trustid.gov.in'
    );
    await tx.wait();
  }

  // Read credentials from disk
  const storageFile = path.resolve(__dirname, '../data/credentials.json');
  if (fs.existsSync(storageFile)) {
    const list = JSON.parse(fs.readFileSync(storageFile, 'utf-8'));
    console.log(`Found ${list.length} credentials in storage file to verify/seed on-chain...`);

    const statusContractWithOwner = statusContract.connect(ownerSigner);

    for (const item of list) {
      const statusId = item.statusId || (item.credential.credentialStatus && item.credential.credentialStatus.id);
      if (!statusId) continue;

      const rec = await statusContract.getCredentialStatus(statusId);
      if (!rec.isRegistered) {
        console.log(`Registering on-chain: ${item.credential.id} (StatusId: ${statusId.substring(0, 16)}...)`);
        try {
          const tx = await statusContractWithOwner.registerCredential(statusId);
          await tx.wait();
          console.log(`  -> Registered on block ${tx.blockNumber}`);
        } catch (err) {
          console.warn(`  -> Could not register ${statusId}:`, err.message);
        }
      } else {
        console.log(`Already registered on-chain: ${item.credential.id}`);
      }
    }
  }

  const total = await statusContract.getTotalCredentials();
  console.log('Total registered credentials on-chain now:', total.toString());
}

main().catch(console.error);
