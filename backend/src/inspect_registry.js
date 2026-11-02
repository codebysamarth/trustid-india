const { ethers } = require('ethers');
const contracts = require('../../frontend/src/config/contracts.json');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const statusAddress = contracts.contracts.CredentialStatusRegistry.address;
  const statusContract = new ethers.Contract(statusAddress, contracts.contracts.CredentialStatusRegistry.abi, provider);

  const count = await statusContract.getTotalCredentials();
  console.log('Total registered credentials on-chain:', count.toString());

  const allIds = await statusContract.getAllCredentialIds();
  for (let i = 0; i < allIds.length; i++) {
    const id = allIds[i];
    const rec = await statusContract.getCredentialStatus(id);
    console.log(`[#${i}] ID:`, id);
    console.log('   Issuer on-chain:', rec.issuer);
    console.log('   isRegistered:', rec.isRegistered);
    console.log('   isRevoked:', rec.isRevoked);
    console.log('   revocationReason:', rec.reason);
  }
}

main().catch(console.error);
