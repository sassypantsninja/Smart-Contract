const Web3 = require('web3');
require('dotenv').config();

// Configure Web3 with your Infura or other Ethereum node URL
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_WS_URL));

// Set up the smart contract
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const abi = [/* YOUR_CONTRACT_ABI */];
const contract = new web3.eth.Contract(abi, contractAddress);

const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

async function monitorMempool() {
    web3.eth.subscribe('pendingTransactions', async (error, txHash) => {
        if (error) {
            console.error('Error subscribing to pending transactions:', error);
            return;
        }

        try {
            const tx = await web3.eth.getTransaction(txHash);
            if (tx && tx.to && tx.value) {
                // Add your custom logic here. For example:
                // If the transaction value is greater than 1 Ether, trigger the smart contract event
                if (web3.utils.fromWei(tx.value, 'ether') > 1) {
                    console.log('High value transaction detected:', tx);

                    const message = `High value transaction of ${web3.utils.fromWei(tx.value, 'ether')} Ether detected`;
                    const triggerTx = contract.methods.triggerEvent(message);
                    const gas = await triggerTx.estimateGas({ from: account.address });
                    const gasPrice = await web3.eth.getGasPrice();

                    await triggerTx.send({
                        from: account.address,
                        gas,
                        gasPrice
                    });

                    console.log('Smart contract event triggered');
                }
            }
        } catch (err) {
            console.error('Error processing transaction:', err);
        }
    });
}

monitorMempool();
