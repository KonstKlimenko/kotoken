const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const _ = require('lodash');
const dateFormat = require('dateformat');
const cfg = require("./config");
const processor = require('./processing');
const auth = require('./auth');
const db = require('./db');
const interfaceBal = require('./serviceFunctions/getBalance.js');
const interfaceMsg = require('./serviceFunctions/sendMessage.js');


const app = express();
const port = 3000;


let dbOptions = {
    database: cfg.mongo.db,
    collectionName: cfg.mongo.collection,
};


var nocache = require('nocache');
app.use(nocache());


app.use(cors({
    origin: '*',
    // allowedHeaders: 'Content-Type,Authorization',
    exposedHeaders: "authorization,cache-control,content-type"
}));


app.use(bodyParser.json());

app.post("/authorize", (req, resp) => {
    let userName = _.get(req, "body.userName");
    let password = _.get(req, "body.password");
    console.log(`Authorization request: ${userName}, Password: ${password}`);
    if (userName && userName.toLowerCase() == 'admin' && password == cfg.auth.adminPassword) {
        auth.sign({user: "admin"}, cfg.auth.jwtSECRET, {}).then(
            token => {
                console.log("Authorized");
                resp.header('Access-Control-Allow-Origin', '*');
                // resp.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
                // resp.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
                resp.set("Authorization", token);
                resp.status(200).end();

            })
    } else {
        console.log("Forbidden");
        resp.status(403).end();
    }
});


function isAuthorisedUser(req) {
    return _.toLower(req.user) == "admin";
}

app.get("/list", auth.middleware, (req, resp) => {
    db.getUsersList().then(data => {
        console.log(`Request for list from user: ${req.user}`);
        if (!isAuthorisedUser(req)) {
            console.log("User's request for list - Hide numbers");
            data = data.map(item => Object.assign({}, item, {username: '*******' + _.get(item, "username").substring(7, 15)}));
        }
        resp.header('Access-Control-Allow-Origin', '*');
        resp.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
        resp.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

        data.forEach(item => delete item.blingerId);

        resp.send(data);
    }).catch((err) => {
        resp.status(500);
        resp.end(err);
    });
});


app.post("/approval", auth.middleware, (req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');
    let approval = _.get(req, "body");
    let username = _.get(approval, "username");
    if (isAuthorisedUser(req) && username) {
        let messageToUser;
        db.findUser(username).then(data => {
            userData = data[0];
            if (approval.decision === "decline") {
                userData.active.decision = "declined";
                messageToUser = "Your image wasn't accepted. You can do better. Try again."
            } else {
                let amount = _.get(approval, "sum");
                if (amount && amount > 0) {
                    processor.hackerSendTokens(userData.blingerId, amount);
                    userData.active.decision = "approved";
                    userData.active.amount = amount;
                    messageToUser = "Congratulations! Your image is great. You'll have bonus tokens."
                }
            }
            userData.activeHistory = userData.activeHistory || [];
            userData.activeHistory.push(userData.active);
            userData.active=null;
            db.saveUser(userData);
            if (messageToUser) interfaceMsg.sendMessageFromAdmin(userData.blingerId, messageToUser);

        })
    }
    resp.status(200);
    resp.end();
});


app.post("/data", (req, resp) => {
    console.log('/////////new request/////////');
    if (req.body) {
        console.log(req.body);

        var strMsg = '' + req.body.message.message;
        var userID = '' + req.body.message.from_user_id;

        console.log(strMsg);
        console.log("From:" + userID);

        db.findUser(req.body.from_user.title).then(data => {
            if (data.length === 0) {

                interfaceBal.getBalance(userID).then(walletData => {
                    console.log("Wallet Data:", walletData);
                    let userData = {
                        address: walletData.address,
                        balance: walletData.balance,
                        created: dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
                        username: req.body.from_user.title,
                        blingerId: userID
                    };
                    return db.saveUser(userData).then(() => {
                        console.log("New user added:", userData);
                    }).catch(console.log)
                })
            }
            processor.process(userID, strMsg, _.get(data, "[0]"));
        });
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

