const { ethers } = require('ethers');
const contracts = require('../../frontend/src/config/contracts.json');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const issuerAddress = contracts.contracts.IssuerRegistry.address;
  const statusAddress = contracts.contracts.CredentialStatusRegistry.address;
  
  const issuerContract = new ethers.Contract(issuerAddress, contracts.contracts.IssuerRegistry.abi, provider);
  const statusContract = new ethers.Contract(statusAddress, contracts.contracts.CredentialStatusRegistry.abi, provider);

  const testAddr = '0x9584a2efd1bb12a9769e4452117979a41f655084';
  const isAuth = await issuerContract.isIssuerAuthorized(testAddr);
  console.log('Address:', testAddr);
  console.log('isAuthorized:', isAuth);

  const owner = await statusContract.owner();
  console.log('StatusRegistry Owner:', owner);

  // Test static call of registerCredential with testAddr as from
  const dummyStatusId = ethers.keccak256(ethers.toUtf8Bytes('test-credential'));
  try {
    await statusContract.registerCredential.staticCall(dummyStatusId, { from: testAddr });
    console.log('staticCall registerCredential: SUCCESS!');
  } catch (err) {
    console.log('staticCall registerCredential REVERTED:', err.message);
  }
}

main().catch(console.error);
