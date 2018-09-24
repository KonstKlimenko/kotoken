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

function addUser(document){
    let userData = Object.assign({}, dbOptions,{documents: document});
    return new promise((resolve, reject)=>{
        mLab.insertDocuments(userData, (err, data) => {
            console.log("Insert user", err, data);
            if (err) {
                return reject(err);
            }
            resolve(data);
        })
    })
}

module.exports = {
    getUsersList: getUsersList,
    findUser: findUser,
    addUser: addUser
};