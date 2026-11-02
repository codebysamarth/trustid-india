const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const targetAddress = '0x9584a2efd1bb12a9769e4452117979a41f655084';
  const bal = await provider.getBalance(targetAddress);
  console.log('Target address:', targetAddress);
  console.log('Balance on Hardhat:', ethers.formatEther(bal), 'ETH');
}

main().catch(console.error);
