/** @type import('hardhat/config').HardhatUserConfig */

require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
const {API_KEY, PRIVATE_KEY} = process.env;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${API_KEY}`,
        blockNumber: 17228670,
        accounts: [`0x${PRIVATE_KEY}`]
      }
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};
