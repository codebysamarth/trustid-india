const { ethers } = require('ethers');

async function main() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const targetAddress = '0x9584a2efd1bb12a9769e4452117979a41f655084';

  const signer = await provider.getSigner(0);
  console.log('Sending 100 ETH from Account #0:', await signer.getAddress());

  const tx = await signer.sendTransaction({
    to: targetAddress,
    value: ethers.parseEther('100.0'),
  });
  await tx.wait();

  const newBal = await provider.getBalance(targetAddress);
  console.log('SUCCESS! Address:', targetAddress);
  console.log('New Balance on Hardhat:', ethers.formatEther(newBal), 'ETH');
}

main().catch(console.error);
