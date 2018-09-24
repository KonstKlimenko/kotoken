const cfg = require('../config.js');
const _ = require('lodash');
const util = require('util')
const axios = require('axios');
const db = require('../db');
const interfaceMsg = require('./sendMessage.js');
const interfaceABI = require('./abiKTK.js');

var abi = interfaceABI.getABI();

var adminID = cfg.blinger.adminId; //'1420959';

axios.defaults.baseURL = 'https://api.blinger.ru/1.0';
axios.defaults.headers.common['Authorization'] = cfg.blinger.apiToken; // 'b98a079f9530d84131c910b2c2cff905';

var ethers = require('ethers');

//Provider
const provider = ethers.providers.getDefaultProvider('ropsten');


var methods = {};

function sendEtherium(walletAdmin, toAddress, toUserId, amount) {
    const transaction = {
        gasLimit: 500000,
        gasPrice: ethers.utils.bigNumberify("100000000000"),
        nonce: 0,
        from: walletAdmin.address,
        to: toAddress,
        value: ethers.utils.parseEther('' + amount),
        data: "0x",
        // This ensures the transaction cannot be replayed on different networks
        chainId: cfg.etherium.networkId // ropsten
    };

    console.log("Send Etheriums to users", util.inspect(transaction));
    return walletAdmin.sendTransaction(transaction).then(tx =>
        tx.wait().then(res => {
            console.log(`Etheriums are transfered to ${transaction.to}`);
            if (toUserId!=adminID) {
                interfaceMsg.sendMessage(adminID, toUserId, `New GAS arrived. ${cfg.etherium.ethToUsers} ETHs added to your wallet ${cfg.etherium.etherscanAddress}/${toAddress}. You can send tokens now!`);
            }
        })
    );
}

function sendEtheriumToUsers(walletAdmin, walletFrom, senderUserId, walletTo, recipientUserId) {
    return sendEtherium(walletAdmin, walletFrom.address, senderUserId, cfg.etherium.ethToUsers)
        .then(() =>
            walletTo ? sendEtherium(walletAdmin, walletTo.address, recipientUserId, cfg.etherium.ethToUsers) : Promise.resolve()
        )
}

function updateUserBalance(wallet) {
    db.findUser(wallet.address, "address").then(userData => {
        if (_.size(userData) > 0) {
            userData.balance = '' + wallet.balance;
            db.saveUser(userData.balance);
        }
    })
}

methods.sendKTK = function (_fromName, _fromPass, _toName, _toPass, amount, _ctrAddress) {
    //Contract creator
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
                return ethers.Wallet.fromBrainWallet(fromName, fromPass).then(function (walletFrom) {
                    walletFrom.provider = provider;
                    walletAdmin.provider = provider;

                    //Create a contract from wallet, so sendPromises are sent and signed by that wallet
                    var contractFrom = new ethers.Contract(ctrAddress, abi, walletFrom);

                    console.log(`walletFrom - Private key: ${walletFrom.privateKey} \nwalletFrom - Address: ${walletFrom.address}`);

                    ethers.Wallet.fromBrainWallet(toName, toPass).then(function (walletTo) {
                        walletTo.provider = provider;

                        var contractTo = new ethers.Contract(ctrAddress, abi, walletTo);

                        console.log(`walletTo - Private key: ${walletTo.privateKey} \nwalletTo - Address: ${walletTo.address}`);


                        var callPromise = contractFrom.balanceOf(walletFrom.address).then(function (result) {
                            console.log('walletFrom - Old_Balance: ' + result);
                        });
                        var callPromise = contractFrom.balanceOf(walletTo.address).then(function (result) {
                            console.log('walletTo - Old_Balance: ' + result);
                        });

                        contractFrom.transfer(walletTo.address, amount).then(function (result) {
                            let senderName= (fromName==cfg.etherium.creatorName) ? 'Admin' : fromName;
                            let recipient = (fromName==cfg.etherium.creatorName) ? toName : fromName;
                            var msgInit = `///////Transaction initiated///////\nfrom user: ${senderName}\namount: ${amount} ${cfg.etherium.tokenName}s`;
                            console.log(msgInit);
                            var msgInit = interfaceMsg.sendMessage(adminID, recipient, msgInit);
                        }).catch(err => {
                            console.log(err);
                            sendEtheriumToUsers(walletAdmin, walletFrom, fromName);
                        });

                        contractFrom.ontransfer = function (from, to, amount) {
                            var msgConf = `///////Transaction confirmed///////\nfrom: ${from}\nto: ${cfg.etherium.etherscanAddress}/${to}\namount: ${amount} ${cfg.etherium.tokenName}s`;
                            console.log(msgConf);
                            var msgConf = interfaceMsg.sendMessage(adminID, toName, msgConf);


                            var msgConf = interfaceMsg.sendMessage(adminID, toName, msgConf);
                            var callPromise = contractFrom.balanceOf(walletFrom.address).then(function (result) {
                                console.log('walletFrom - New_Balance: ' + result);
                                updateUserBalance(walletFrom);

                            });
                            var callPromise = contractFrom.balanceOf(walletTo.address).then(function (result) {
                                console.log('walletTo - New_Balance: ' + result);
                                updateUserBalance(walletTo);
                            });
                            sendEtheriumToUsers(walletAdmin, walletFrom, fromName, walletTo, toName);
                        };

                    });

                });

            }
        )
};

module.exports = methods;