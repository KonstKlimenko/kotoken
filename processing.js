const cfg = require('./config.js');
const _ = require('lodash');
const isUrl = require('is-url');
var interfaceKTK = require('./serviceFunctions/sendKTK.js');
var interfaceQR = require('./serviceFunctions/sendQR.js');
var interfaceMsg = require('./serviceFunctions/sendMessage.js');
var interfaceBal = require('./serviceFunctions/getBalance.js');
const db = require('./db');

//Token contract address
const ctrAddress = cfg.etherium.contractAddress; //'0xd08D431AeD057dF91c36427Ea140d2a78ab0905A';

//var data = {"webhook":"on_message_incoming","from_user_id":1424413,"to_user_id":1420959,"message":"\u0411\u043e\u043b\u044c\u0448\u043e\u0439 \u041a\u0438\u0441\u043b\u043e\u0432\u0441\u043a\u0438\u0439 9"}

var message = 'pay 1425254 100';
var fromID = '1421443';

//Blinger paremeters for admin
var adminID = cfg.blinger.adminId; // '1420959';
var adminTel = cfg.blinger.adminTel; // '79857293807';

//Contract creator
var creatorName = cfg.etherium.creatorName; //'user1'
var creatorPass = cfg.etherium.creatorPass; //'mySimplePassword1';

var methods = {};

function setActiveUrl(userData, url) {
    console.log('URL :', url);
    userData.active = {};
    userData.active.url = url;//'https://bitcoin.org/img/home/bitcoin-img.svg?1537556757';
    db.saveUser(userData);
}

methods.hackerSendTokens = function (toID, amount) {
    return interfaceKTK.sendKTK(creatorName, creatorPass, toID, toID, amount, ctrAddress);
};

methods.hackerRequest = function (_fromID, amount, userData) {
    if (!_.get(userData, "hackerUsed")) {
        methods.hackerSendTokens(_fromID, amount);
        userData.hackerUsed = 1 + (userData.hackerUsed || 0);
        db.saveUser(userData);
    } else {
        interfaceMsg.sendMessage(adminID, _fromID, "Credit has already been used");
    }
};

methods.process = function (_fromID, _message, userData) {
    fromID = _fromID;
    var msgArr = _message.trim().split(" ");

    if (msgArr[0].toUpperCase() == 'PAY') {
        var amount = parseInt(msgArr[2]);
        if (amount > 0) {
            let toIDPromise = Promise.resolve(msgArr[1]);
            if (msgArr[1]==='SberBook') {
                toIDPromise=Promise.resolve(adminID)
            } else if (_.trim(msgArr[1]).length == 11 || _.trim(msgArr[1]).length == 12) {
                let telephoneNumber = msgArr[1];
                toIDPromise = db.findUser(telephoneNumber)
                    .then(userData => userData[0].blingerId)
            }

            toIDPromise.then(toID => {
                console.log('Initiate payment of ' + amount + ' tokens to ' + toID);
                var toName = toID;
                var toPass = toID;
                if (toID == adminID) {
                    toName = creatorName;
                    toPass = creatorPass;
                }
                var send = interfaceKTK.sendKTK(fromID, fromID, toName, toPass, amount, ctrAddress);
            })
        }
    } else if (_.includes(['BALANCE', 'БАЛАНС'], msgArr[0].toUpperCase())) {
        var bal = interfaceBal.sendBalanceToUser(fromID);
    } else if (msgArr[0].toUpperCase() == 'QR') {
        console.log('Here is your QR code to receive payments');
        var message = `https://wa.me/${adminTel}?text=PAY%20${fromID}%20${msgArr[1] || '%20'}`;
        var send = interfaceQR.sendQR(adminID, fromID, message);

    } else if (_.includes(['HACKER', 'MONEY', 'ДАЙДЕНЕГ', 'ДЕНЕГДАЙ', 'ДАЙ', 'ДЕНЕГ'], msgArr[0].toUpperCase())) {
        methods.hackerRequest(fromID, cfg.engine.freeTokensAmount, userData);
    } else if (_.includes(['PHOTO', 'FOTO'], _.toUpper(msgArr[0]))) {
        setActiveUrl(userData, msgArr[1]);
    } else {
        if (isUrl(msgArr[0])) {
            setActiveUrl(userData, msgArr[0]);
            interfaceMsg.sendMessage(adminID, _fromID, "Thank you for your motion");
        } else {
            console.log('Unknown command', msgArr[0]);
            interfaceMsg.sendMessage(adminID, _fromID, `${cfg.engine.help}`);
        }
    }
};

module.exports = methods;
