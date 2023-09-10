1. Install required modules
   
   ```shell
    $ npm install --save-dev hardhat
    $ npm install --save-dev @nomiclabs/hardhat-ethers 
    $ npm install @openzeppelin/contracts
    $ npm install --save-dev @nomiclabs/hardhat-etherscan
    $ npm install dotenv --save-dev
   ```

    Also, you should create file .env which contains API_URL, API_KEY, PRIVATE_KEY, and ETHERSCAN_API_KEY.
    
    API_URL and API_KEY comes from Alchemy.
    ![step1-1](./readme_image/step1-1.png)
    ![step1-2](./readme_image/step1-2.png)
    
    PRIVATE_KEY is your one of metamask wallet's address' private key.
    ![step1-3](./readme_image/step1-3.png)
    ![step1-4](./readme_image/step1-4.png)
    ![step1-5](./readme_image/step1-5.png)
    ![step1-6](./readme_image/step1-6.png)
    
    ETHERSCAN_API_KEY comes from Etherscan.
    ![step1-7](./readme_image/step1-7.png)
    ![step1-8](./readme_image/step1-8.png)
    

2. Develop an ERC20 token: 
   
    - <span style="color:#808080"> 18 decimals. </span>
    - <span style="color:#808080"> Minting and burning capability with onlyOwner access control. </span>
    - <span style="color:#808080"> Ability to transfer ownership </span>
    
    The above functionalities is in contracts/erc20_token.sol
    .</span>
    
3. Deploy your ERC20 token. Mint 1000 tokens (i.e. 1000 * 10^18 units) to yourself. **(Record the address of your own token)**
   
    ```shell
        $ npx hardhat run scripts/deploy.js --network goerli
    ```
    ![step3-1_deploy_erc20token_command](./readme_image/step3-1_deploy_erc20token_command.png)
    ![step3-2_deploy_erc20token_etherscan](./readme_image/step3-2_deploy_erc20token_etherscan.png)

4. Go to Aave, lend ETH and borrow DAI out **(Record your Borrow transaction)**
   
    <span style="color:#808080"> 1. Go to AaveV3 Goerli: [https://staging.aave.com/?marketName=proto_goerli_v3](https://staging.aave.com/?marketName=proto_goerli_v3) </span>
    
    <span style="color:#808080"> 2. On the left, Supply 0.05 ETH. </span>
    ![step4-1](readme_image/step4-1.png)
    ![step4-2](readme_image/step4-2.png)
    
    <span style="color:#808080"> 3.  Borrow some DAI (50 or 100) </span>
    ![step4-3](readme_image/step4-3.png)
    ![step4-4](readme_image/step4-4.png)
    ![step4-5](readme_image/step4-5.png)
5. Go to Etherscan and get the address of the DAI **(Record the address of the DAI token)**
    - <span style="color:#808080"> As this is a testnet, there are a lot of different versions of DAI, we’re going to use the one you borrowed out from Aave. </span>
    
    ![step5-1](readme_image/step5-1.png)
    ![step5-2](readme_image/step5-2.png)
6. Go to UniswapV2 to create a new liquidity pair: [https://app.uniswap.org/#/pools/v2](https://app.uniswap.org/#/pools/v2) 
    - <span style="color:#808080"> Make sure you are on Goerli testnet </span>
    ![step6-1](readme_image/step6-1.png)
    ![step6-2](readme_image/step6-2.png)
    - <span style="color:#808080"> “Add V2 Liquidity” </span>
    ![step6-3](readme_image/step6-3.png)
    - <span style="color:#808080"> paste the address of your DAI token you have in one field (the ui should show you that you have some) </span>
    ![step6-4](readme_image/step6-4.png)
    ![step6-5](readme_image/step6-5.png)
    ![step6-6](readme_image/step6-6.png)
    - <span style="color:#808080"> Paste the address of your own token in the other field </span>
    ![step6-7](readme_image/step6-7.png)
    ![step6-8](readme_image/step6-8.png)
    ![step6-9](readme_image/step6-9.png)
    - <span style="color:#808080"> We can actually set the initial price of the token by determining the ratio between DAI and your token: let’s make your token worth 10 DAI by supplying 100 DAI to 10 of your token. (or 50 DAI to 5 of your token). </span>
    ![step6-10](readme_image/step6-10.png)

    - <span style="color:#808080"> Approve DAI and your token to Uniswap, and hit the Supply button. (It will ask you to “Create pool and Supply”) </span>
    ![step6-11](readme_image/step6-11.png)
    ![step6-12](readme_image/step6-12.png)
    ![step6-13](readme_image/step6-13.png)
    ![step6-14](readme_image/step6-14.png)
    ![step6-15](readme_image/step6-15.png)
    ![step6-16](readme_image/step6-16.png)
    ![step6-17](readme_image/step6-17.png)
    ![step6-18](readme_image/step6-18.png)
    ![step6-19](readme_image/step6-19.png)
    
    - <span style="color:#808080"> You will receive some pool tokens as per this transaction. Look at your address on Etherscan and determine the address of the token. **(Record the address of the pool token)** </span>
    ![step6-20](readme_image/step6-20.png)
    ![step6-21](readme_image/step6-21.png)
    
    - <span style="color:#808080"> Try [Swap](https://app.uniswap.org/#/swap), you should be able to swap your token to DAI now. Buy 0.001 of your token now. **(Record the transaction)** </span>
    ![step6-22](readme_image/step6-22.png)
    ![step6-23](readme_image/step6-23.png)
    ![step6-24](readme_image/step6-24.png)
    ![step6-25](readme_image/step6-25.png)
    ![step6-26](readme_image/step6-26.png)

7. Create a [Safe (Gnosis’s multiSig solution) on Goerli](https://app.safe.global/new-safe/create) **(Record the address of your Safe multiSig address)**
    - <span style="color:#808080"> Have 2 owners in the Safe. You can use Metamask to generate the second address. </span>
    - <span style="color:#808080"> Set the Threshold as 2 out of 2 owners. This means that every time this multiSig is sending a transaction, both of these owners have to sign. </span>
    ![step7-1](readme_image/step7-1.png)
    ![step7-2](readme_image/step7-2.png)
    ![step7-3](readme_image/step7-3.png)
    ![step7-4](readme_image/step7-4.png)
    ![step7-5](readme_image/step7-5.png)
    ![step7-6](readme_image/step7-6.png)
8. Transfer Ownership of your token to your Safe multiSig address. **(Record the transaction)**
    You should set TOKEN_ADDRESS and SAFE_MULTISIG_ADDRESS in .env file before running the command.

    ```shell
        $ npx hardhat run scripts/transfer_ownership.js --network goerli
    ```
    ![step8-1](readme_image/step8-1.png)
    ![step8-2](readme_image/step8-2.png)
    ![step8-3](readme_image/step8-3.png)

    Check if the owner is sucessfully changed.
    ![step8-4](readme_image/step8-4.png)

9.  Mint 10000 of your tokens by using your Safe multiSig address to your own address **(Record the transaction)**
    ![step9-1](readme_image/step9-1.png)
    ![step9-2](readme_image/step9-2.png)
    ![step9-3](readme_image/step9-3.png)
    ![step9-4](readme_image/step9-4.png)
    ![step9-5](readme_image/step9-5.png)
    ![step9-6](readme_image/step9-6.png)
    ![step9-7](readme_image/step9-7.png)
    ![step9-8](readme_image/step9-8.png)
    ![step9-9](readme_image/step9-9.png)
    ![step9-10](readme_image/step9-10.png)
    ![step9-11](readme_image/step9-11.png)
    ![step9-12](readme_image/step9-12.png)
    ![step9-13](readme_image/step9-13.png)
    ![step9-14](readme_image/step9-14.png)
    ![step9-15](readme_image/step9-15.png)
    ![step9-16](readme_image/step9-16.png)
    ![step9-17](readme_image/step9-17.png)
    ![step9-18](readme_image/step9-18.png)
    ![step9-19](readme_image/step9-19.png)
10. Sell all of the 10000 tokens into the Uniswap pool you created. **(Record the transaction)**
    ![step10-1](readme_image/step10-1.png)
    ![step10-2](readme_image/step10-2.png)
    ![step10-3](readme_image/step10-3.png)
    ![step10-4](readme_image/step10-4.png)
    ![step10-5](readme_image/step10-5.png)
    ![step10-6](readme_image/step10-6.png)
    ![step10-7](readme_image/step10-7.png)
    ![step10-8](readme_image/step10-8.png)
    ![step10-9](readme_image/step10-9.png)
    ![step10-10](readme_image/step10-10.png)
    ![step10-11](readme_image/step10-11.png)