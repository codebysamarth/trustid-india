const { ethers } = require('ethers');
const contracts = require('../../frontend/src/config/contracts.json');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const userAddr = '0x9584a2efd1bb12a9769e4452117979a41f655084';

  // Hardhat provider can impersonate any account or we can use account #0
  const owner = await provider.getSigner(0);
  const statusContract = new ethers.Contract(contracts.contracts.CredentialStatusRegistry.address, contracts.contracts.CredentialStatusRegistry.abi, owner);

  const testId = ethers.keccak256(ethers.toUtf8Bytes('test-register-' + Date.now()));
  console.log('Testing registerCredential with ID:', testId);

  const tx1 = await statusContract.registerCredential(testId);
  const r1 = await tx1.wait();
  console.log('registerCredential confirmed in block:', r1.blockNumber);

  console.log('Testing revokeCredential with same ID...');
  const tx2 = await statusContract.revokeCredential(testId, 'Test Revocation');
  const r2 = await tx2.wait();
  console.log('revokeCredential confirmed in block:', r2.blockNumber);

  const status = await statusContract.getCredentialStatus(testId);
  console.log('Status on-chain:', {
    isRegistered: status.isRegistered,
    isRevoked: status.isRevoked,
    reason: status.reason
  });
}

main().catch(console.error);
