const { ethers } = require("hardhat");

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const METAMSK_WALLET_ADDRESS = process.env.METAMSK_WALLET_ADDRESS;
const FLASHLOAN_EXECUTOR_ADDRESS = process.env.FLASHLOAN_EXECUTOR_ADDRESS;
const MINTED_WPC_NFT_TOKENID = process.env.MINTED_WPC_NFT_TOKENID;

const alchemyProvider = new ethers.providers.AlchemyProvider(network="goerli", API_KEY);
const signer = new ethers.Wallet(PRIVATE_KEY, alchemyProvider);

const flashloan_executor_json = require("../artifacts/contracts/flash_loan_executor.sol/FlashLoanExecutor.json");
const flashloan_executor = new ethers.Contract(FLASHLOAN_EXECUTOR_ADDRESS, flashloan_executor_json.abi, signer);

async function main(){
    // trasnfer NFT to my address
    const tx_transfer_nft = await flashloan_executor.connect(signer).transferNFT(METAMSK_WALLET_ADDRESS, MINTED_WPC_NFT_TOKENID);
    await tx_transfer_nft.wait();
    console.log("Transfer NFT with token ID: ", MINTED_WPC_NFT_TOKENID, " to my address: ", METAMSK_WALLET_ADDRESS, " with tx: ", tx_transfer_nft.hash);
}

main();