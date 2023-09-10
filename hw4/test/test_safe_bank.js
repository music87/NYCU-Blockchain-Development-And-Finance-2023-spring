const { ethers } = require("hardhat");
const { expect } = require('chai');


// const API_URL = process.env.API_URL; // const API_KEY = process.env.API_KEY;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;
// const provider = new ethers.providers.JsonRpcProvider(API_URL); //new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
// const signer = new ethers.Wallet(PRIVATE_KEY, provider);

describe("SafeBank", function () {
    before(async () => {
        signer = await ethers.getSigner();
    });
    
    it("The owner of the SafeBank contract should take fee properly", async function () {
        const fee_percent = 0.001; // 0.1%
        const init_token_supply_amount = 123456;
        const deposit_amount = 3456;
        const withdraw_amount = 123;
        const token_name = "BDAFLAB4TOKEN"
        const token_symbol = "bdaflab4_coin"
        const wallet_signer1 = signer;

        // wallet_signer1 owns the SafeBank contract
        const SafeBank = await ethers.getContractFactory("SafeBank", wallet_signer1);
        const safe_bank = await SafeBank.deploy(wallet_signer1.address);
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
        const expected_fee = Math.round(deposit_amount * fee_percent);
        await token.connect(wallet_signer1).approve(safe_bank.address, init_token_supply_amount);
        const tx_deposit = await safe_bank.connect(wallet_signer1).deposit(token.address, deposit_amount);
        await tx_deposit.wait();
        await expect(Number(await token.balanceOf(wallet_signer1.address))).equal(init_token_supply_amount - deposit_amount);
        await expect(Number(await safe_bank.connect(wallet_signer1).get_balance(token.address))).to.equal(deposit_amount - expected_fee);
        await expect(Number (await safe_bank.connect(wallet_signer1).get_fee(token.address))).to.equal(expected_fee);
        console.log("Wallet1's ", token_symbol, " token balance in its wallet:", await token.balanceOf(wallet_signer1.address));
        console.log("Wallet1's ", token_symbol, " token balance in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_balance(token.address)); 
        console.log("Wallet1's current fee in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_fee(token.address)); // check fee balance in wallet_signer1

        // wallet_signer1 withdraws withdraw_amount tokens from SafeBank
        console.log("Withdrawing tokens...");
        const tx_withdraw = await safe_bank.connect(wallet_signer1).withdraw(token.address, withdraw_amount);
        await tx_withdraw.wait();
        await expect(Number(await token.balanceOf(wallet_signer1.address))).to.equal(init_token_supply_amount - deposit_amount + withdraw_amount);
        await expect(Number(await safe_bank.connect(wallet_signer1).get_balance(token.address))).to.equal(deposit_amount - expected_fee - withdraw_amount);
        console.log("Wallet1's ", token_symbol, " token balance in its wallet:", await token.balanceOf(wallet_signer1.address));
        console.log("Wallet1's ", token_symbol, " token balance in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_balance(token.address));
        console.log("Wallet1's current fee in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_fee(token.address)); // check fee balance in wallet_signer1

        // take fee
        console.log("Taking fee...");
        const tx_take_fee = await safe_bank.connect(wallet_signer1).takefee(token.address);
        await tx_take_fee.wait();
        await expect(Number(await safe_bank.connect(wallet_signer1).get_fee(token.address))).to.equal(0);
        console.log("Wallet1's current fee in SafeBank contract:", await safe_bank.connect(wallet_signer1).get_fee(token.address)); // check fee balance in wallet_signer1

    });

});