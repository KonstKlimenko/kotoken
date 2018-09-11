const jwt = require('jsonwebtoken')


/**
 * @return {Promise} true/Error
 */
module.exports.verify = (token, SECRET) => {

    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (error, decoded) => {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    return reject("TOKEN_EXPIRED")
                }
                return reject({message: error.message })
            }
            return resolve(decoded)
        })
    })
};

/**
 * @return {Promise} string (token)
 */
module.exports.sign = (playload, SECRET, options) => {
    return new Promise((resolve, reject) => {
        jwt.sign(playload, SECRET, options, (error, token) => {
            if (error) return reject("TOKEN_NOT_SIGNED");
            return resolve(token)
        })
    })
};