
const fs = require('fs');
const path = require('path');
const Decimal = require('decimal');
const Token = require('./class_token.js');
const TokenPairPool = require('./class_token_pair_pool.js');
const token_table_path = path.join(__dirname, '../token_table.json');

class SwapTransaction {
    static token_table = {};
    constructor(pending_tx, swap_function_decoder) {
        this.decoded_data = swap_function_decoder.parseTransaction({ data: pending_tx.data, value: pending_tx.value });
        // args: [
        //     amountIn: BigNumber { _hex: '', _isBigNumber: true },
        //     amountOutMin: BigNumber { _hex: '', _isBigNumber: true },
        //     path: [
        //     '',
        //     ''
        //     ],
        //     to: '',
        //     deadline: BigNumber { _hex: '', _isBigNumber: true }
        // ]
        this.tokens = [];
        this.token_pair_pools = [];
    }

    async initialize(provider, factory_contract) {
        for (const token_address of this.decoded_data.args.path) 
            await this.set_token_contract(provider, token_address);
        for (let i = 1; i < this.tokens.length; i++) 
            await this.set_pair_address_and_reserve(provider, factory_contract, this.tokens[i-1], this.tokens[i]);
    }

    async set_token_contract(provider, token_address) {
        if (SwapTransaction.token_table[token_address]) {
            this.tokens.push(SwapTransaction.token_table[token_address]);
        } else {
            const token = new Token(provider, token_address);
            await token.initialize();
            this.tokens.push(token);
            SwapTransaction.token_table[token.address] = token;
            SwapTransaction.save_tokens_to_file();
        }
    }

    async set_pair_address_and_reserve(provider, factory_contract, token1, token2) {
        const token_pair_pool = new TokenPairPool();
        await token_pair_pool.initialize(provider, factory_contract, token1, token2);
        this.token_pair_pools.push(token_pair_pool);
    }

    async calculate_slippage(router_contract) {
        this.amount_in = new Decimal(this.decoded_data.args.amountIn / (10**this.tokens[0].decimals));
        process.stdout.write(`[${(new Date).toLocaleTimeString()}] amount_in: ${this.amount_in}\n`);
        this.amount_out_min = new Decimal(this.decoded_data.args.amountOutMin / (10**this.tokens[this.tokens.length-1].decimals));
        process.stdout.write(`[${(new Date).toLocaleTimeString()}] amount_out_min: ${this.amount_out_min}\n`);
        this.optimal_amount_out_min_calculated = new Decimal((await router_contract.callStatic.getAmountsOut(this.decoded_data.args.amountIn, this.tokens.map(token => token.address)))[1] / (10**this.tokens[this.tokens.length-1].decimals));
        process.stdout.write(`[${(new Date).toLocaleTimeString()}] optimal_amount_out_min_calculated: ${this.optimal_amount_out_min_calculated}\n`);
        this.slippage = (this.optimal_amount_out_min_calculated - this.amount_out_min) / this.amount_out_min;
        process.stdout.write(`[${(new Date).toLocaleTimeString()}] slippage: ${this.slippage * 100}%\n`);
    }

    async sandwitch_attack(router_contract) {
        // approve router contract to spend tokens
        for (const token of this.tokens) {
            const approve_tx = await token.contract.approve(router_contract.address, ethers.constants.MaxUint256);
            await approve_tx.wait();
        }

        // front run the swap transaction
        const swap_tx = await router_contract.swapExactTokensForTokens(
            this.decoded_data.args.amountIn,
            this.decoded_data.args.amountOutMin,
            this.decoded_data.args.path,
            this.decoded_data.args.to,
            this.decoded_data.args.deadline,
            { gasLimit: 10000000 }
        );
        await swap_tx.wait();
        console.log(`[${(new Date).toLocaleTimeString()}] front run swap transaction ${swap_tx.hash}`);

        // check if the swap transaction is successful
        const swap_tx_receipt = await provider.getTransactionReceipt(swap_tx.hash);
        if (swap_tx_receipt.status == 1) {
            process.stdout.write(`[${(new Date).toLocaleTimeString()}] Swap transaction ${swap_tx.hash} is successful\n`);
        }

        // check if the sandwitch attack is successful
        const amount_out = (await router_contract.callStatic.getAmountsOut(this.decoded_data.args.amountIn, this.tokens.map(token => token.address)))[1];
        const amount_out_min = amount_out * (1 - this.slippage);
        const swap_tx_sandwitch = await router_contract.swapExactTokensForTokens(
            this.decoded_data.args.amountIn,
            amount_out_min,
            this.decoded_data.args.path,
            this.decoded_data.args.to,
            this.decoded_data.args.deadline,
            { gasLimit: 10000000 }
        );
        await swap_tx_sandwitch.wait();
        const swap_tx_sandwitch_receipt = await provider.getTransactionReceipt(swap_tx_sandwitch.hash);
        if (swap_tx_sandwitch_receipt.status == 1) {
            process.stdout.write(`[${(new Date).toLocaleTimeString()}] Sandwitch attack transaction ${swap_tx_sandwitch.hash} is successful\n`);
        }






    }

    static save_tokens_to_file() {
        fs.writeFileSync(
            token_table_path,
            JSON.stringify(
              Object.values(SwapTransaction.token_table).map((token) => ({
                symbol: token.symbol,
                address: token.address, 
                decimals: token.decimals,
              }))
            )
          );
    }

    static read_tokens_from_file(provider) {
        const token_table = JSON.parse(fs.readFileSync(token_table_path));
        for (const token of token_table) {
            const token_object = new Token(provider, token.address);
            token_object.symbol = token.symbol;
            token_object.address = token.address;
            token_object.decimals = token.decimals;
            SwapTransaction.token_table[token.address] = token_object;
        }
        
    }



}

module.exports = SwapTransaction;

