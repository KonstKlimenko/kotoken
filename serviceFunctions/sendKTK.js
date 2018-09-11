const cfg = require('../config.js');
const axios = require('axios');
const interfaceMsg = require('./sendMessage.js');
const interfaceABI = require('./abiKTK.js');

var abi = interfaceABI.getABI();

const ctrAddress = cfg.etherium.contractAddress; //'0xd08D431AeD057dF91c36427Ea140d2a78ab0905A';

var adminID = cfg.blinger.adminId; //'1420959';

axios.defaults.baseURL = 'https://api.blinger.ru/1.0';
axios.defaults.headers.common['Authorization'] = cfg.blinger.apiToken; // 'b98a079f9530d84131c910b2c2cff905';

var ethers = require('ethers');

//Provider
const provider = ethers.providers.getDefaultProvider('ropsten');


var methods = {};

function startTransferContract(directionLogMsg, walletAdmin, userName, amount) {

    return ethers.Wallet.fromBrainWallet(userName, userName).then(function (walletUser) {
        walletUser.provider = provider;

        //Create a contract from wallet, so sendPromises are sent and signed by that wallet
        let contract = new ethers.Contract(ctrAddress, abi, walletAdmin);

        console.log(`${directionLogMsg} - Private key: ${walletUser.privateKey}\tAddress: ${walletUser.address}`);

        contract.balanceOf(walletUser.address).then(() => {
            console.log(`${directionLogMsg} - Old_Balance: + result`);
        }).then(
            () => contract.transfer(walletUser.address, amount)
        );

        return {contract: contract, walletUser: walletUser};
    })
}

methods.sendKTK = function (_fromName, _fromPass, _toName, _toPass, _amount, _ctrAddress) {
    //Conract creator
    var fromName = _fromName;
    var fromPass = _fromPass;

    //Test user
    var toName = _toName;
    var toPass = _toPass;


    //Contract definition
    var ctrAddress = _ctrAddress;

    //Wait until the wallet connected
    return ethers.Wallet.fromBrainWallet(cfg.etherium.creatorName, cfg.etherium.creatorPass)
        .then(walletAdmin => {
                walletAdmin.provider = provider;

                let senderToAdminTransfer = startTransferContract("walletFrom", walletAdmin, _fromName, _fromPass, -_amount);

                senderToAdminTransfer.contract.then(() => {
                    console.log(`\n----------------------Contract User ${_fromName} to Admin initiated--------------------`);
                });

                senderToAdminTransfer.contract.ontransfer = function (from, to, amount) {
                    console.log(`\n----------------------Contract User ${from} to Admin for ${amount} initiated--------------------`);
                    let adminToRecipientTransfer = startTransferContract("walletTo", walletAdmin, _toName, _amount);

                    adminToRecipientTransfer.contract.then(() => {
                        var msgInit = `//////////////Transaction initiated//////////////\nfrom user: ${fromName}\n amount: ${amount}`;
                        console.log(msgInit);
                        interfaceMsg.sendMessage(adminID, toName, msgInit);
                    });

                    adminToRecipientTransfer.contract.ontransfer = function (from, to, amount) {
                        var msgConf = `//////////////Transaction confirmed//////////////\nfrom: ${from}\nto: ${to} \namount: ${amount}`;
                        console.log(msgConf);

                        interfaceMsg.sendMessage(adminID, toName, msgConf);

                        adminToRecipientTransfer.contract.balanceOf(adminToRecipientTransfer.walletUser.address).then(function (result) {
                            console.log('walletFrom - New_Balance: ' + result);
                        });

                        adminToRecipientTransfer.contract.balanceOf(adminToRecipientTransfer.walletUser.address).then(function (result) {
                            console.log('walletTo - New_Balance: ' + result);
                        });

                    };
                };


                return ethers.Wallet.fromBrainWallet(fromName, fromPass).then(function (walletFrom) {
                    walletFrom.provider = provider;

                    //Create a contract from wallet, so sendPromises are sent and signed by that wallet
                    var contract = new ethers.Contract(ctrAddress, abi, walletFrom);

                    console.log(`walletFrom - Private key: ${walletFrom.privateKey} \nwalletFrom - Address: ${walletFrom.address}`);

                    var walletTo = ethers.Wallet.fromBrainWallet(toName, toPass).then(function (walletTo) {
                        walletTo.provider = provider;

                        console.log(`walletTo - Private key: ${walletTo.privateKey} \nwalletTo - Address: ${walletTo.address}`);

                        var callPromise = contract.balanceOf(walletFrom.address).then(function (result) {
                            console.log('walletFrom - Old_Balance: ' + result);
                        });
                        var callPromise = contract.balanceOf(walletTo.address).then(function (result) {
                            console.log('walletTo - Old_Balance: ' + result);
                        });

                        var amount = _amount;
                        var sendPromise = contract.transfer(walletTo.address, amount).then(function (result) {
                            var msgInit = '//////////////Transaction initiated//////////////' + '\n' +
                                'from user: ' + fromName + '\n' +
                                'amount: ' + amount;
                            console.log(msgInit);
                            var msgInit = interfaceMsg.sendMessage(adminID, toName, msgInit);
                        });

                        contract.ontransfer = function (from, to, amount) {
                            var msgConf = '//////////////Transaction confirmed//////////////' + '\n' +
                                'from: ' + from + '\n' +
                                'to: ' + to + '\n' +
                                'amount: ' + amount;
                            console.log(msgConf);
                            var msgConf = interfaceMsg.sendMessage(adminID, toName, msgConf);
                            var callPromise = contract.balanceOf(walletFrom.address).then(function (result) {
                                console.log('walletFrom - New_Balance: ' + result);
                            });
                            var callPromise = contract.balanceOf(walletTo.address).then(function (result) {
                                console.log('walletTo - New_Balance: ' + result);
                            });
                        };
                    });
                });
            }
        )
};

module.exports = methods;