const { ethers } = require("hardhat");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BANK_TOKEN_ADDRESS = process.env.BANK_TOKEN_ADDRESS;
const WPC_NFT_CONTRACT_ADDRESS = process.env.WPC_NFT_CONTRACT_ADDRESS;

const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

async function main() {
    // deploy executor contract
    const FlashLoanExecutor = await ethers.getContractFactory("FlashLoanExecutor", signer);
    const flashloan_executor = await FlashLoanExecutor.deploy(BANK_TOKEN_ADDRESS, WPC_NFT_CONTRACT_ADDRESS);
    console.log("FlashLoanExecutor deployed to address: ", flashloan_executor.address, " with bank token address: ", BANK_TOKEN_ADDRESS, " and WPC NFT address: ", WPC_NFT_CONTRACT_ADDRESS);
}
main();