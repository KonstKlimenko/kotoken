var ethers = require('ethers');
var fs = require('fs');

var username = "user1";
var password = 'mySimplePassword1';

const provider = ethers.providers.getDefaultProvider('ropsten');

//contract from abi and bytecode
var abi = fs.readFileSync('ctrABI.txt', 'utf8');
var bytecode = fs.readFileSync('ctrBC.txt', 'utf8');

var deployTransaction = ethers.Contract.getDeployTransaction(bytecode, abi);

var wallet = ethers.Wallet.fromBrainWallet(username, password).then(function(wallet) {
    wallet.provider = provider;
    //console.log("Private key: " + wallet.privateKey);
    var sendPromise = wallet.sendTransaction(deployTransaction);

    sendPromise.then(function(transaction) {
        console.log(transaction);
    });
});