const jwt = require('jsonwebtoken');
const cfg = require("./config");

/**
 * @return {Promise} true/Error
 */
function verify(token, SECRET) {

    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    return reject("TOKEN_EXPIRED")
                }
                return reject({message: error.message})
            }
            return resolve(decoded)
        })
    })
}

/**
 * @return {Promise} string (token)
 */
function sign(playload, SECRET, options) {
    return new Promise((resolve, reject) => {
        jwt.sign(playload, SECRET, options, (error, token) => {
            if (error) return reject("TOKEN_NOT_SIGNED");
            return resolve(token)
        })
    })
}


function middleware(req, res, next) {
    console.log("Verifying token", req.headers.authorization);
    request = verify(req.headers.authorization, cfg.auth.jwtSECRET)
        .then(decoded=>{
            req.user = decoded.user;
            next();
        })
        .catch(err=>{
            console.log(err);
            next();
        })
}


module.exports = {
    sign: sign,
    middleware: middleware
};