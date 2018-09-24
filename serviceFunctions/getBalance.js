const cfg = require('../config.js');
const interfaceABI = require('./abiKTK.js');
var ethers = require('ethers');
const interfaceMsg = require('./sendMessage.js');

const provider = ethers.providers.getDefaultProvider('ropsten');

const ctrAddress = cfg.etherium.contractAddress; //'0xd08D431AeD057dF91c36427Ea140d2a78ab0905A';
const abi = interfaceABI.getABI();

var adminID = cfg.blinger.adminId; //'1420959';
//Contract creator
var creatorName = cfg.etherium.creatorName; //'user1'
var creatorPass = cfg.etherium.creatorPass; //'mySimplePassword1';

var methods = {};

methods.getBalance = function (_ID) {
    var username = _ID;
    var pass = _ID;
    return ethers.Wallet.fromBrainWallet(creatorName, creatorPass).then(function (walletAdmin) {
        walletAdmin.provider = provider;

        // var contract = new ethers.Contract(ctrAddress, abi, walletAdmin);
        var contract = new ethers.Contract(ctrAddress, abi, walletAdmin);

        return ethers.Wallet.fromBrainWallet(username, pass).then(function (wallet) {
            return contract.balanceOf(wallet.address).then(function (result) {
                console.log('balance is ' + result + ' tokens for ' + wallet.address);
                return {balance: ''+result, address: wallet.address};
            });
        });
    });
};

methods.sendBalanceToUser = function (_toID) {
    return methods.getBalance(_toID).then(walletData => {
            console.log("Send To user");
            let strBal = `Your balance is ${walletData.balance} tokens\n Your ether address is ${cfg.etherium.etherscanAddress}/${walletData.address}`;
            console.log(adminID, _toID, strBal, interfaceMsg);
            return interfaceMsg.sendMessage(adminID, _toID, strBal)
        }
    )
};

module.exports = methods;