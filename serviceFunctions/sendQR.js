var fs = require('fs');

//Generate filename for QR image
var fileName = 'qr_svg' + Math.floor(Math.random() * 100000000) + '.png';

//Init Axios for http requests
const axios = require('axios');
axios.defaults.baseURL = 'https://api.blinger.ru/1.0';
axios.defaults.headers.common['Authorization'] = 'b98a079f9530d84131c910b2c2cff905';

//Init cloudinary service
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dbq8v7bof',
    api_key: '433225836211643',
    api_secret: '6P8S9M1rOUNdSaMIijuTknR6pFQ'
});

var methods = {};

methods.sendQR = function(_fromID, _toID, _message) {
    //Generate a QR code
    var qr = require('qr-image');
    var qr_svg = qr.image(_message, { type: 'png' });

    //Save QR code to disk
    qr_svg.pipe(require('fs').createWriteStream(fileName));

    //Upload QR to cloudinary
    cloudinary.uploader.upload(fileName, function(result) {
        var resURL = result.url;
        var resID = result.public_id;

        //Send link to uploaded QR to via Blinger
        axios.post('/message.sendFile', {
            from_user_id: _fromID,
            to_user_id: _toID,
            url: resURL
        })
        .then(function (response) {
            //Delete QR from disk
            fs.unlink(fileName, function(error) {
                if (error) {
                    throw error;
                }
            });
                //Delete QR from cloudinary
                cloudinary.uploader.destroy(resID, function(error, result){
            });
        })
        .catch(function (error) {
            console.log(error.name);
            console.log(error.status);
            console.log(error.message);
        });
    });
}

module.exports = methods;

