/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('solidity-coverage')
require("hardhat-gas-reporter");

const API_URL = process.env.API_URL;
// const PRIVATE_KEY = process.env.PRIVATE_KEY;
//const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "localhost",
  networks: {
    hardhat: {},
    localhost: {
      url: API_URL,
      // accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    //apiKey: ETHERSCAN_API_KEY
  }, 
  gasReporter: {
    currency: "ETH",
    outputFile: "gas-report.txt"
  }
};
