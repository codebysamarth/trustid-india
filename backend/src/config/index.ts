import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const contractsConfigPath = path.resolve(__dirname, './contracts.json');
let contractsConfig: any = null;

if (fs.existsSync(contractsConfigPath)) {
  try {
    contractsConfig = JSON.parse(fs.readFileSync(contractsConfigPath, 'utf-8'));
  } catch (err) {
    console.warn('Warning: Could not parse contracts.json in backend config:', err);
  }
}

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  RPC_URL: process.env.RPC_URL || 'http://127.0.0.1:8545',
  CHAIN_ID: process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID, 10) : 31337,

  // Standard Hardhat Local Accounts (Well-documented test accounts for local development)
  // Account #0: Deployer & Governance Governor
  GOVERNANCE_PRIVATE_KEY:
    process.env.GOVERNANCE_PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',

  // Account #1: Demo University 1 (IIT Bombay Demo)
  DEMO_ISSUER_PRIVATE_KEY:
    process.env.DEMO_ISSUER_PRIVATE_KEY ||
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',

  // Account #2: Demo University 2 (NIT Karnataka Demo)
  DEMO_ISSUER_2_PRIVATE_KEY:
    process.env.DEMO_ISSUER_2_PRIVATE_KEY ||
    '0x5de4111afa1a4b94908f83103eb2f958084297f005d5c641d3e2392471010c78',

  CONTRACTS: contractsConfig,
};

export function getContractsConfig() {
  if (fs.existsSync(contractsConfigPath)) {
    try {
      return JSON.parse(fs.readFileSync(contractsConfigPath, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}
