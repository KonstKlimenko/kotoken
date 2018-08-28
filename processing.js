var interfaceKTK = require('./serviceFunctions/sendKTK.js');
var interfaceQR = require('./serviceFunctions/sendQR.js');
var interfaceMsg = require('./serviceFunctions/sendMessage.js');
var interfaceBal = require('./serviceFunctions/getBalance.js');

//Token contract address
var ctrAddress = '0xd08D431AeD057dF91c36427Ea140d2a78ab0905A';

//var data = {"webhook":"on_message_incoming","from_user_id":1424413,"to_user_id":1420959,"message":"\u0411\u043e\u043b\u044c\u0448\u043e\u0439 \u041a\u0438\u0441\u043b\u043e\u0432\u0441\u043a\u0438\u0439 9"}

//var res = data["message"].split(" ");
//console.log(res[0].toUpperCase());

var message = 'pay 1425254 100';
var fromID = '1421443';

//Blinger paremeters for admin
var adminID = '1420959';
var adminTel = '79857293807';

//Contract creator
var creatorName = 'user1'
var creatoPass = 'mySimplePassword1';

message = '';

var msgArr = message.trim().split(" ");

if(msgArr[0].toUpperCase()=='PAY'){
    var amount = parseInt(msgArr[2]);
    if(amount > 0){
        var toID = msgArr[1];
        console.log('Initiate payment of ' + amount + ' tokens to ' + toID);
        var send = interfaceKTK.sendKTK(fromID,fromID,toID,toID,amount,ctrAddress);
    };
}else if(msgArr[0].toUpperCase()=='BALANCE'){

    //Send user his/her balance
    var bal = interfaceBal.getBalance(fromID);

}else if(msgArr[0].toUpperCase()==''){

    console.log('Here is your QR code to receive payments');
    var message = 'https://wa.me/' + adminTel + '?text=' + 'PAY%20' + fromID + '%20';
    var send = interfaceQR.sendQR(adminID, fromID, message);

}else{
    console.log('Unknown command');
}