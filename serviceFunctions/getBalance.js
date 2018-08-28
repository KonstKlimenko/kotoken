const interfaceABI = require('./abiKTK.js');
var ethers = require('ethers');
const interfaceMsg = require('./sendMessage.js');

const provider = ethers.providers.getDefaultProvider('ropsten');

const ctrAddress = '0xd08D431AeD057dF91c36427Ea140d2a78ab0905A';
const abi = interfaceABI.getABI();

var adminID = '1420959';
//Contract creator
var creatorName = 'user1'
var creatoPass = 'mySimplePassword1';

var methods = {};

methods.getBalance = function(_ID) {
    var username = _ID;
    var pass = _ID;
    var walletAdmin = ethers.Wallet.fromBrainWallet(creatorName, creatoPass).then(function(walletAdmin) {
        walletAdmin.provider = provider;

        var contract = new ethers.Contract(ctrAddress, abi, walletAdmin);

        var wallet = ethers.Wallet.fromBrainWallet(username, pass).then(function(wallet) {
            var callPromise = contract.balanceOf(wallet.address).then(function(result) {
                    console.log('balance is ' + result + ' tokens for ' + wallet.address);

                    var strBal = 'Your balance is ' + result + ' tokens\n'+
                                 'Your ether address is '  +wallet.address;
                    var msgBal = interfaceMsg.sendMessage(adminID, _ID, strBal);
            });
        });
    });
}

module.exports = methods;