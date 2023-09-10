
const { ethers } = require("hardhat");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

async function main() {
    const init_token_supply_amount = 1000;
    const token_name = "BDAFLAB4TOKEN"
    const token_symbol = "bdaflab4_coin"
    
    const SimpleErc20Token = await ethers.getContractFactory("SimpleErc20Token", signer);
    const token = await SimpleErc20Token.deploy(token_name, token_symbol, init_token_supply_amount);
    console.log("Token ", token_name, " (", token_symbol, ") deployed to address:", token.address);
}

main()