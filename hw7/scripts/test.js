const { ethers } = require("hardhat");
const { expect } = require('chai');
const { BigNumber } = require("ethers");
const rich_usdc_account_address = process.env.RICH_USDC_ADDRESS;
const rich_weth_account_address = process.env.RICH_WETH_ADDRESS;
const contract_addresses = require('./usdc_mainnet_addresses.json');
const comet_abi = require('../artifacts/contracts/contract_interfaces.sol/IComet.json').abi;
const erc20_abi = require('../artifacts/contracts/contract_interfaces.sol/IERC20.json').abi;
const number_with_commas = (bignumber, decimal) => {
    var val = bignumber.toString();
    // convert e+5 to 100000
    const e = val.indexOf("e");
    if (e != -1){
        const n = val.slice(0, e).split(".");
        const zeroLength = val.slice(e + 2);
        const afterZero = "0".repeat(zeroLength);
        val = n.join("") + afterZero;
    }
    // add commas
    var after_decimal = val.slice(-decimal, val.length);
    after_decimal = after_decimal.replace(/0+$/, "");
    const before_decimal = val.slice(0, -decimal);
    // drop trailing zeros
    if (after_decimal.length == 0){
        return before_decimal.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    } else {
        return before_decimal.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + "." + after_decimal;
    }
};
  

describe("Compound Liquidity", function () {
    before(async function () {
        alice = await ethers.getImpersonatedSigner(rich_usdc_account_address);
        bob = await ethers.getImpersonatedSigner(rich_weth_account_address);
        signer = await ethers.getSigner();
        comet_address = contract_addresses.cUSDCv3;
        usdc_address = contract_addresses.USDC;
        weth_address = contract_addresses.WETH;
    });
    
    it("Check all addresses", async function () {
        // each address should not be null
        expect(comet_address).to.not.equal(null);
        expect(alice.address).to.not.equal(null);
        expect(bob.address).to.not.equal(null);
        expect(signer.address).to.not.equal(null);
        expect(usdc_address).to.not.equal(null);
        expect(weth_address).to.not.equal(null);
        // print out all addresses
        // console.log("Comet address: ", comet_address);
        // console.log("Alice address: ", alice.address);
        // console.log("Bob address: ", bob.address);
        // console.log("Signer address: ", signer.address);
        // console.log("USDC address: ", usdc_address);
        // console.log("WETH address: ", weth_address);
    });

    it("Setup comet, usdc, and weth contracts", async function () {
        comet = new ethers.Contract(comet_address, comet_abi, signer);
        usdc = new ethers.Contract(usdc_address, erc20_abi, signer);
        weth = new ethers.Contract(weth_address, erc20_abi, signer);
        expect(comet).to.not.equal(null);
        expect(usdc).to.not.equal(null);
        expect(weth).to.not.equal(null);
    });


    it("Alice supplies 1000 USDC to the Compound USDC contract", async function () {
        const decimal = 5;
        const supply_amount = ethers.utils.parseUnits("1000", decimal);
        const comet_usdc_balance_before_alice_supply = parseFloat(await usdc.balanceOf(comet_address));
        console.log("Alice's USDC balance: ", number_with_commas(await usdc.balanceOf(alice.address), decimal));
        console.log("Comet's USDC balance: ", number_with_commas(comet_usdc_balance_before_alice_supply, decimal));
        console.log("Alice provides liquidity (1000 USDC) into the Compound USDC contract");
        const tx_alice_approve = await usdc.connect(alice).approve(comet_address, supply_amount);
        await tx_alice_approve.wait();
        const tx_alice_supply = await comet.connect(alice).supply(usdc_address, supply_amount);
        await tx_alice_supply.wait();
        const comet_usdc_balance_after_alice_supply = parseFloat(await usdc.balanceOf(comet_address));
        console.log("Alice's USDC balance: ", number_with_commas(await usdc.balanceOf(alice.address), decimal));
        console.log("Comet's USDC balance: ", number_with_commas(comet_usdc_balance_after_alice_supply, decimal));
        expect(comet_usdc_balance_after_alice_supply).to.equal(comet_usdc_balance_before_alice_supply + parseFloat(supply_amount));
    });

    it("Bob supply lots of WETH to the Compound contract ... ", async function () {
        const decimal = 18;
        const supply_amount = ethers.utils.parseEther('50000');
        const comet_weth_balance_before_bob_supply = await weth.balanceOf(comet_address);
        console.log("Bob's WETH balance: ", number_with_commas(await weth.balanceOf(bob.address), decimal));
        console.log("Comet's WETH balance: ", number_with_commas(comet_weth_balance_before_bob_supply, decimal));
        console.log("Bob provides liquidity (50000 WETH) into the Compound USDC contract ... ");
        const tx_bob_approve = await weth.connect(bob).approve(comet_address, ethers.constants.MaxUint256);
        await tx_bob_approve.wait();
        const tx_bob_supply = await comet.connect(bob).supply(weth_address, supply_amount);
        await tx_bob_supply.wait();
        const comet_weth_balance_after_bob_supply = await weth.balanceOf(comet_address);
        console.log("Bob's WETH balance: ", number_with_commas(await weth.balanceOf(bob.address), decimal));
        console.log("Comet's WETH balance: ", number_with_commas(comet_weth_balance_after_bob_supply, decimal));
        expect(comet_weth_balance_after_bob_supply.sub(comet_weth_balance_before_bob_supply).eq(supply_amount)).to.equal(true);
    });

    it("Bob withdraws all the liquidity from the Compound USDC contract", async function () {
        const decimal = 5;
        const borrow_size = 469633380;
        console.log("Bob's USDC balance: ", number_with_commas(await usdc.balanceOf(bob.address), decimal));
        console.log("Comet's USDC balance: ", number_with_commas(await usdc.balanceOf(comet_address), decimal));
        console.log("Bob borrows 469,633,380 USDC from the Compound USDC contract ... ");
        const tx_bob_withdraw = await comet.connect(bob).withdraw(usdc_address, (borrow_size * 10 ** decimal).toString());
        await tx_bob_withdraw.wait();
        console.log("Bob's USDC balance: ", number_with_commas(await usdc.balanceOf(bob.address), decimal));
        const comet_usdc_balance_after_bob_withdraw = await usdc.balanceOf(comet_address);
        console.log("Comet's USDC balance: ", number_with_commas(comet_usdc_balance_after_bob_withdraw, decimal));
        expect(comet_usdc_balance_after_bob_withdraw.sub(10**decimal).isNegative()).to.equal(true);

    });

    it("Alice tries to withdraw 1000 USDC from the Compound USDC contract", async function () {
        const decimal = 5;
        const withdraw_amount = ethers.utils.parseUnits("1000", decimal);
        const comet_usdc_balance_before_alice_withdraw = parseFloat(await usdc.balanceOf(comet_address));
        console.log("Alice's USDC balance: ", number_with_commas(await usdc.balanceOf(alice.address), decimal));
        console.log("Comet's USDC balance: ", number_with_commas(comet_usdc_balance_before_alice_withdraw, decimal));
        console.log("Alice withdraws 1000 USDC from the Compound USDC contract ... ");
        const tx_alice_withdraw = await comet.connect(alice).withdraw(usdc_address, withdraw_amount);
        await tx_alice_withdraw.wait();
        const comet_usdc_balance_after_alice_withdraw = parseFloat(await usdc.balanceOf(comet_address));
        console.log("Alice's USDC balance: ", number_with_commas(await usdc.balanceOf(alice.address), decimal));
        console.log("Comet's USDC balance: ", number_with_commas(comet_usdc_balance_after_alice_withdraw, decimal));
        expect(comet_usdc_balance_after_alice_withdraw).to.equal(comet_usdc_balance_before_alice_withdraw - parseFloat(withdraw_amount));
    });
});
