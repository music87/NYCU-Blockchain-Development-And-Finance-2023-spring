const bip39 = require('bip39');
const crypto = require('crypto');
const etherwallet = require('ethereumjs-wallet').default
const { hdkey } = require('ethereumjs-wallet')
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// vanity address generator
function vanity_address_generator(prefix) {
	while(true) {
		// obtain random entropy and its corresponding mnemonic
		const entropy = crypto.randomBytes(32);
		const mnemonic = bip39.entropyToMnemonic(entropy);
		// convert the mnemonic to seed
		const seed = bip39.mnemonicToSeedSync(mnemonic);
		// use seed to obtain hdwallet and derive sub-wallet with derivation path m/44'/60'/0'/0
		const wallet = hdkey.fromMasterSeed(seed).derivePath("m/44'/60'/0'/0/0").getWallet();
		// get the address of the sub-wallet
		const address = wallet.getAddressString();
		// check if the address starts with the desired prefix
		if (address.startsWith(prefix)) {
			// if it does, print the address and the mnemonic
			console.log('Found address: ' + address);
			console.log('With mnemonic: ' + mnemonic);
		} else {
			// else, repeat the process
		}
	}
}

// generate vanity address with multi threading
function multi_threading(func_name, func_args) {
	if (cluster.isMaster) {
		for (let i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on('exit', (worker, code, signal) => {
			//console.log(`worker ${worker.process.pid} finished`);
		});
	}
	else {
		func_name(func_args);
	}
}

// read prefix from command line and run the code
if (process.argv.length == 3) {
	multi_threading(vanity_address_generator, process.argv[2]);
}
else {
	console.log('Please enter a prefix to search for');
	console.log('Example: node hw2_vanity_address_generator.js 0x87')
}

