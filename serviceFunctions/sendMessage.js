const cfg = require('../config.js');

//Init Axios for http requests
const axios = require('axios');
axios.defaults.baseURL = 'https://api.blinger.ru/1.0';
axios.defaults.headers.common['Authorization'] = cfg.blinger.apiToken; // 'b98a079f9530d84131c910b2c2cff905';

var methods = {};

var adminID = cfg.blinger.adminId;

methods.sendMessageFromAdmin = function (toID, message) {
    return methods.sendMessage(adminID, toID, message)
};

methods.sendMessage = function (_fromID, _toID, _message) {

    //Send message to User via Blinger
    console.log(`Sending message to user ${_toID}: ${_message}`);
    axios.post('/message.sendText', {
        from_user_id: _fromID,
        to_user_id: _toID,
        message: _message
    })
        .then(function (response) {
            console.log(`Send message to user ${_toID}: ${_message}`);
            // console.dir(response, { depth: 2, colors: true });
        })
        .catch(function (error) {
            console.log(error.name);
            console.log(error.status);
            console.log(error.message);
            console.dir(error, {depth: 3, colors: true});
        });
};

module.exports = methods;

