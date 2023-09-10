const { ethers } = require("hardhat");
const { expect } = require('chai');

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const SAFEBANK_ADDRESS = process.env.SAFEBANK_ADDRESS;
// const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

// provider - Alchemy
const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);

// signer - you
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

// contract instance
// const contract_json = require("../artifacts/contracts/safe_bank.sol/SafeBank.json");
// const safe_bank = new ethers.Contract(SAFEBANK_ADDRESS, contract_json.abi, signer);
// const token_json = require("../artifacts/contracts/erc20_token.sol/SimpleErc20Token.json");
// const token = new ethers.Contract(TOKEN_ADDRESS, token_json.abi, signer);

// Construct tests with Hardhat (You will have to create your own ERC20)
// 1. Create a SafeBank contract
// 2. Create an ERC20 token contract
// 3. Mint some tokens to the SafeBank contract
// 4. Deposit some tokens into the SafeBank contract
// 5. Withdraw some tokens from the SafeBank contract
// 6. Check the ERC20 token balances in the SafeBank contract and the wallet

async function test() {
    const init_token_supply_amount = 123456;
    const deposit_amount = 456;
    const withdraw_amount = 123;
    const token_name = "BDAFLAB3TOKEN"
    const token_symbol = "bdaflab3_c1"
    const wallet_signer1 = signer; //await ethers.getSigners();
    
    // wallet_signer1 owns the SafeBank contract
    const SafeBank = await ethers.getContractFactory("SafeBank", wallet_signer1);
    const safe_bank = await SafeBank.deploy();
    console.log("SafeBank deployed to address:", safe_bank.address);
    
    // wallet_signer1 owns the SimpleErc20Token contract
    // the token constructor will mint init_token_supply_amount tokens to its owner (wallet_signer1)
    const SimpleErc20Token = await ethers.getContractFactory("SimpleErc20Token", wallet_signer1);
    const token = await SimpleErc20Token.deploy(token_name, token_symbol, init_token_supply_amount);
    console.log("Token ", token_name, " (", token_symbol, ") deployed to address:", token.address);

    console.log("Wallet1's ", token_symbol, " token balance in its wallet:", await token.balanceOf(wallet_signer1.address)); // check token balance in wallet_signer1
    console.log("Wallet1's ", token_symbol, " token balance in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_balance(token.address)); // check SafeBank balance in wallet_signer1

    // wallet_signer1 approves SafeBank to spend at most init_token_supply_amount tokens
    // wallet_signer1 deposits deposit_amount tokens from its wallet to SafeBank
    console.log("Depositing tokens...");
    await token.connect(wallet_signer1).approve(safe_bank.address, init_token_supply_amount);
    const tx_deposit = await safe_bank.connect(wallet_signer1).deposit(token.address, deposit_amount);
    await tx_deposit.wait();
    await expect(await token.balanceOf(wallet_signer1.address)).to.equal(init_token_supply_amount - deposit_amount);
    await expect(await safe_bank.connect(wallet_signer1).get_balance(token.address)).to.equal(deposit_amount);
    console.log("Wallet1's ", token_symbol, " token balance in its wallet:", await token.balanceOf(wallet_signer1.address));
    console.log("Wallet1's ", token_symbol, " token balance in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_balance(token.address)); 

    // // wallet_signer1 withdraws withdraw_amount tokens from SafeBank
    console.log("Withdrawing tokens...");
    const tx_withdraw = await safe_bank.connect(wallet_signer1).withdraw(token.address, withdraw_amount);
    await tx_withdraw.wait();
    await expect(await token.balanceOf(wallet_signer1.address)).to.equal(init_token_supply_amount - deposit_amount + withdraw_amount);
    await expect(await safe_bank.connect(wallet_signer1).get_balance(token.address)).to.equal(deposit_amount - withdraw_amount);
    console.log("Wallet1's ", token_symbol, " token balance in its wallet:", await token.balanceOf(wallet_signer1.address));
    console.log("Wallet1's ", token_symbol, " token balance in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_balance(token.address));
}


test();