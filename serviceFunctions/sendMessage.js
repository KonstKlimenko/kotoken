const cfg = require('../config.js');
var util = require('util');

//Init Axios for http requests
const axios = require('axios');
axios.defaults.baseURL = 'https://api.blinger.ru/1.0';
axios.defaults.headers.common['Authorization'] =  cfg.blinger.apiToken; // 'b98a079f9530d84131c910b2c2cff905';

var methods = {};

methods.sendMessage = function(_fromID, _toID, _message) {

        //Send message to User via Blinger
        axios.post('/message.sendText', {
            from_user_id: _fromID,
            to_user_id: _toID,
            message: _message
        })
        .then(function (response) {
            // console.log(`Send message to user ${_fromID}: ${_message}`);
        })
        .catch(function (error) {
            console.log(error.name);
            console.log(error.status);
            console.log(error.message);
            console.dir(error, { depth: 3, colors: true });
        });
};

module.exports = methods;

