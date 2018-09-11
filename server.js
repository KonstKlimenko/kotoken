const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const dateFormat = require('dateformat');
const cfg = require("./config");
const processor = require('./processing');
const auth = require('./auth');

var mLab = require('mongolab-data-api')(cfg.mongo.apiKey);

const app = express();
const port = 3000;


let dbOptions = {
    database: cfg.mongo.db,
    collectionName: cfg.mongo.collection,
};


app.use(bodyParser.json());

app.post("/authorize", (req, resp) => {
    let userName = _.get(req, "body.userName");
    let password = _.get(req, "body.password");
    console.log(`Authorization request: ${userName}, Password: ${password}` );
    if (userName && userName.toLowerCase() == 'admin' && password == cfg.auth.adminPassword) {
        auth.sign({user: "admin"}, cfg.auth.jwtSECRET, {}).then(
            token => {
                console.log("Authorized");
                resp.set("Authorization", token);
                resp.status(200).end();

            })
    } else {
        console.log("Forbidden");
        resp.status(403).end();
    }
});

app.get("/list", (req, resp) => {

    let request = Promise.resolve();
    if (req.headers.authorization) {
        request = auth.verify(req.headers.authorization, cfg.auth.jwtSECRET).then(decoded => {
            if (decoded.user == "admin") {
                console.log("Authorized's request for list - Allowed");
                return "admin";
            } else {
                console.log("Authorized's request for list - Forbidden");
            }
        });
    } else {
        console.log("User's request for list");
    }

    request.then(user=>{
        mLab.listDocuments(dbOptions, (err, data) => {
            if (err) {
                console.log("Mongo finding error:", err);
                resp.status(500);
                resp.end(err);
                return;
            }
            if (data && !Array.isArray(data)) {
                data=[data];
            }
            resp.send(data.map(item => Object.assign({}, item, {username: user=='admin'? item.username : '*******' + _.get(item,"username").substring(7,15)})));
        });

    })
});


app.post("/data", (req, resp) => {
    console.log('/////////new request/////////');
    if (req.body) {
        console.log(req.body);

        var strMsg = '' + req.body.message.message;
        var userID = '' + req.body.message.from_user_id;

        console.log(strMsg);
        console.log("From:" + userID);

        var searchOptions = Object.assign({}, dbOptions, {query: `{ "username": "${req.body.from_user.title}"}`});

        mLab.listDocuments(searchOptions, (err, data) => {
            if (err) {
                console.log("Mongo finding error:", err);
                return;
            }
            if (data && Array.isArray(data)) {
                if (data.length === 0) {
                    let interfaceBal = require('./serviceFunctions/getBalance.js');

                    return interfaceBal.getBalance(userID).then(walletData => {
                        console.log("Wallet Data:", walletData);

                        let userData = Object.assign({}, dbOptions,
                            {
                                documents: {
                                    address: walletData.address,
                                    balance: walletData.balance,
                                    created: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
                                    username: req.body.from_user.title
                                }
                            });
                        console.log("Insert new user to Mongo", userData);
                        return mLab.insertDocuments(userData, (err, data) => {
                            console.log(err, data);
                        })

                    }).then(
                        () => processor.process(userID, strMsg)
                    )
                } else {
                    return processor.process(userID, strMsg);
                }
            }

        });


//        var process = processor.process(userID, strMsg);

        resp.send('Ok');
    } else {
        console.log("Empty body");
    }
});

app.post("/test", (req, resp) => {
    console.log(req.body);
});

app.get("/", (req, resp) => {
    resp.send('Hello from Express!');
});


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)

});

