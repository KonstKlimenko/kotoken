const axios = require('axios');
const interfaceMsg = require('./sendMessage.js');
const interfaceABI = require('./abiKTK.js');

var abi = interfaceABI.getABI();
var adminID = '1420959';

axios.defaults.baseURL = 'https://api.blinger.ru/1.0';
axios.defaults.headers.common['Authorization'] = 'b98a079f9530d84131c910b2c2cff905';

var ethers = require('ethers');

var methods = {};

methods.sendKTK = function(_fromName, _fromPass, _toName, _toPass, _amount, _ctrAddress) {
    //Conract creator
    var fromName = _fromName;
    var fromPass = _fromPass;

    //Test user
    var toName = _toName;
    var toPass = _toPass;

    //Provider
    const provider = ethers.providers.getDefaultProvider('ropsten');

    //Contract definition
    var ctrAddress = _ctrAddress;

    //Wait until the wallet connected
    var walletFrom = ethers.Wallet.fromBrainWallet(fromName, fromPass).then(function(walletFrom) {
        walletFrom.provider = provider;

        //Create a contract from wallet, so sendPromises are sent and signed by that wallet
        var contract = new ethers.Contract(ctrAddress, abi, walletFrom);

        var msgWalFrom = "walletFrom - Private key: " + walletFrom.privateKey + '\n' +
                         "walletFrom - Address: " + walletFrom.address;
        console.log(msgWalFrom);

        var walletTo = ethers.Wallet.fromBrainWallet(toName, toPass).then(function(walletTo) {
            walletTo.provider = provider;

            var msgWalTo = "walletTo - Private key: " + walletTo.privateKey + '\n' +
                           "walletTo - Address: " + walletTo.address;
            console.log(msgWalTo);

            var callPromise = contract.balanceOf(walletFrom.address).then(function(result) {
                console.log('walletFrom - Old_Balance: ' + result);
            });
            var callPromise = contract.balanceOf(walletTo.address).then(function(result) {
                console.log('walletTo - Old_Balance: ' + result);
            });

            var amount = _amount;
            var sendPromise = contract.transfer(walletTo.address, amount).then(function(result) {
                var msgInit = '//////////////Transaction initiated//////////////' + '\n' +
                            'from user: ' + fromName + '\n' +
                            'amount: ' + amount;
                console.log(msgInit);
                var msgInit = interfaceMsg.sendMessage(adminID, toName, msgInit);
            });

            contract.ontransfer = function(from, to, amount) {
                var msgConf = '//////////////Transaction confirmed//////////////' + '\n' +
                            'from: ' + from + '\n' +
                            'to: ' + to + '\n' +
                            'amount: ' + amount;
                console.log(msgConf);
                var msgConf = interfaceMsg.sendMessage(adminID, toName, msgConf);
                var callPromise = contract.balanceOf(walletFrom.address).then(function(result) {
                    console.log('walletFrom - New_Balance: ' + result);
                });
                var callPromise = contract.balanceOf(walletTo.address).then(function(result) {
                    console.log('walletTo - New_Balance: ' + result);
                });
            };
        });
    });
}

module.exports = methods;