const { ethers } = require("hardhat");
const { expect } = require('chai');
require("hardhat-gas-reporter");

describe("SafeFactory", function () {
    beforeEach(async function () {
        [factory_owner, caller] = await ethers.getSigners();
    });

    it("The caller of deploySafe is the owner of the deployed Safe contract", async function () {
        const SafeFactory = await ethers.getContractFactory("SafeFactory", factory_owner);
        const safe_factory = await SafeFactory.deploy();
        console.log("SafeBank deployed to address:", safe_factory.address);
        console.log("Deploy Safe contract by caller ...")
        const tx_deploy_safe = await safe_factory.connect(caller).deploySafe();
        await tx_deploy_safe.wait();
        const owner_deployed_safe_contract = await safe_factory.connect(caller).get_owner_of_deploySafe();
        expect(owner_deployed_safe_contract).to.equal(caller.address);
        console.log("The caller address: ", caller.address);
        console.log("The owner address of the deployed Safe contract: ", owner_deployed_safe_contract);
    });

    it("The caller of deploySafeProxy is the owner of the deployed Proxy.", async function () {
        const SafeFactory = await ethers.getContractFactory("SafeFactory", factory_owner);
        const safe_factory = await SafeFactory.deploy();
        console.log("SafeBank deployed to address:", safe_factory.address);
        console.log("Deploy Proxy contract by caller ...")
        const tx_deploy_safe_proxy = await safe_factory.connect(caller).deploySafeProxy();
        await tx_deploy_safe_proxy.wait();
        const owner_deployed_safe_proxy_contract = await safe_factory.connect(caller).get_owner_of_deploySafeProxy();
        expect(owner_deployed_safe_proxy_contract).to.equal(caller.address);
        console.log("The caller address: ", caller.address);
        console.log("The owner address of the deployed Proxy contract: ", owner_deployed_safe_proxy_contract);      
    });

    it("After updateImplementation is being called, a newly deployed proxy with deploySafeProxy() points to the new implementation instead of the old one.", async function () {
        const SafeFactory = await ethers.getContractFactory("SafeFactory", factory_owner);
        const safe_factory = await SafeFactory.deploy();
        console.log("SafeBank deployed to address:", safe_factory.address);

        const SafeUpgradeable = await ethers.getContractFactory("SafeUpgradeable", caller);
        const safe_upgradeable = await SafeUpgradeable.deploy();
        console.log("SafeUpgradeable contract deployed to address:", safe_upgradeable.address);
        
        console.log("The implementation address of the deployed Safe contract before update: ", await safe_factory.connect(caller).get_logic());

        const tx_update_implementation = await safe_factory.connect(factory_owner).updateImplementation(safe_upgradeable.address);
        await tx_update_implementation.wait();
        
        console.log("The implementation address of the deployed Safe contract after update: ", await safe_factory.connect(caller).get_logic());
    });

});