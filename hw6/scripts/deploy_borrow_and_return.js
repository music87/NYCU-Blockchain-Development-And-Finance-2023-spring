const { ethers } = require("hardhat");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BANK_TOKEN_ADDRESS = process.env.BANK_TOKEN_ADDRESS;

const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

async function main() {
    // deploy borrwo and return contract
    const BorrowAndReturn = await ethers.getContractFactory("BorrowAndReturn", signer);
    const borrow_and_return = await BorrowAndReturn.deploy(BANK_TOKEN_ADDRESS);
    console.log("BorrowAndReturn deployed to address: ", borrow_and_return.address, " with bank token address: ", BANK_TOKEN_ADDRESS);
}
main();