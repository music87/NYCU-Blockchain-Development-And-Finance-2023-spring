const { ethers } = require("hardhat");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const SAFE_MULTISIG_ADDRESS = process.env.SAFE_MULTISIG_ADDRESS;

const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

const token_json = require("../artifacts/contracts/erc20_token.sol/SimpleErc20Token.json");
const token = new ethers.Contract(TOKEN_ADDRESS, token_json.abi, signer);

async function main() {
    console.log("Token is in address ", token.address, " with owner ", token.signer.address);
    const new_owner = SAFE_MULTISIG_ADDRESS;
    const tx = await token.connect(signer).transferOwnership(new_owner);
    await tx.wait();
    console.log("Ownership transfered to ", new_owner, " with tx ", tx.hash);
}

main()