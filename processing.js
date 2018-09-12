const cfg = require('./config.js');
var interfaceKTK = require('./serviceFunctions/sendKTK.js');
var interfaceQR = require('./serviceFunctions/sendQR.js');
var interfaceMsg = require('./serviceFunctions/sendMessage.js');
var interfaceBal = require('./serviceFunctions/getBalance.js');

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

methods.process = function(_fromID, _message) {
    fromID = _fromID;
    var msgArr = _message.trim().split(" ");

    if(msgArr[0].toUpperCase()=='PAY'){
        var amount = parseInt(msgArr[2]);
        if(amount > 0){
            var toID = msgArr[1];
            console.log('Initiate payment of ' + amount + ' tokens to ' + toID);
            var toName = toID;
            var toPass = toID;

            if(toID == adminID){
                toName = creatorName;
                toPass = creatorPass;
            }
            
            var send = interfaceKTK.sendKTK(fromID,fromID,toName,toPass,amount,ctrAddress);
        };
    }else if(msgArr[0].toUpperCase()=='BALANCE'){

        //Send user his/her balance
        var bal = interfaceBal.sendBalanceToUser(fromID);

    }else if(msgArr[0]=='' || msgArr[0].toUpperCase()=='QR'){

        console.log('Here is your QR code to receive payments');
        var message = 'https://wa.me/' + adminTel + '?text=' + 'PAY%20' + fromID + '%20';
        var send = interfaceQR.sendQR(adminID, fromID, message);

    }else if(msgArr[0].toUpperCase()=='HACKER'){

        var send = interfaceKTK.sendKTK(creatorName,creatorPass,fromID,fromID,"1000",ctrAddress);

    }
    else{
        console.log('Unknown command');
        interfaceMsg.sendMessage(adminID, _fromID, "Incorrect command");
    }
};

module.exports = methods;
