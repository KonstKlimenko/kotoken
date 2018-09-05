const express = require('express');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const cfg = require("./config");
const processor = require('./processing');

var mLab = require('mongolab-data-api')(cfg.mongo.apiKey);

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/data", (req, resp) => {
    console.log('/////////new request/////////');
    if (req.body) {
        console.log(req.body);

        var strMsg = '' + req.body.message.message;
        var userID = '' + req.body.message.from_user_id;

        console.log(strMsg);
        console.log("From:" + userID);

        let dbOptions = {
            database: cfg.mongo.db,
            collectionName: cfg.mongo.collection,
        };

        var searchOptions = Object.assign({}, dbOptions, {query: `{ "username": ${req.body.from_user.title}}`});

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

