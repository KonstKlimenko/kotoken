const cfg = require("./config");
let mLab = require('mongolab-data-api')(cfg.mongo.apiKey);


let dbOptions = {
    database: cfg.mongo.db,
    collectionName: cfg.mongo.collection,
};


function getUsersList(searchOptions) {
    return new Promise((resolve, reject) => {
        mLab.listDocuments(searchOptions || dbOptions, (err, data) => {
            if (err) {
                console.log("Mongo finding error:", err);
                reject(err);
            }
            if (data && !Array.isArray(data)) {
                data = [data];
            }
            resolve(data);
        })
    })
}

function findUser(userName) {
    let searchOptions = Object.assign({}, dbOptions, {query: `{ "username": "${userName}"}`});
    return getUsersList(searchOptions);
}

function saveUser(document) {
    let userData = Object.assign({}, dbOptions, {data: document, upsert:true, query:`{ "username": "${document.username}"}`});
    return new Promise((resolve, reject) => {
        mLab.updateDocuments(userData, (err, data) => {
            console.log("Upsert user", err, data);
            if (err) {
                return reject(err);
            }
            findUser(document.username)
                .then(updatedUser => {
                    resolve(updatedUser)
                });
        })
    })
}


module.exports = {
    getUsersList: getUsersList,
    findUser: findUser,
    saveUser: saveUser
};