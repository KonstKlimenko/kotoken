const _ = require("lodash");

const configs = {

    defaults: {
        engine:{
            freeTokensAmount: "1000",
            help: "     Добро пожаловать в мир виртуальной валюты SberCoin. \nДоступные команды для WhatsApp-бота:\n" +
                "Help - помощь\n" +
                "Money,ДайДенег - запросить единоразово 1000 Sber-токенов на свой кошелек\n" +
                "Balance,Баланс - узнать свой баланс\n" +
                "QR < количество > - сформировать QR-код для команды перечисления токенов на ваш кошелек\n" +
                "PAY <mobile or id> <количество> - перечислить токены другому пользователю c указанным номером телефона или id\n" +
                "Подробнее - http://sketches-ether2.azurewebsites.net"
        },
        etherium: {
            tokenName: 'KAT',
            networkId: 3, //ropsten
            etherscanAddress: "https://ropsten.etherscan.io/address",
            ethToUsers: "0.0005"
        },
        mongo: {
            // db: "sketchethe0",
            db: "tokentest",
            collection: "accounts",
            // apiKey: "ISpOrafbDytJQKPP-P0H3i4tToIYJrph",
            apiKey: "i9DRHd3QNKj_wMzkGo2-UBwl6dmsujSY",
            //mongo_api_accounts_crud_url: 'mongodb://api.mlab.com/api/1/databases/sketchethe0/collections/accounts?apiKey=ISpOrafbDytJQKPP-P0H3i4tToIYJrph',
        },
        auth: {
            adminPassword: "setBeforeDeploy",
            jwtSECRET: "setBeforeDeploy"
        }
    },

    konst: {
        etherium: {
            contractAddress: "0xd08D431AeD057dF91c36427Ea140d2a78ab0905A",
            creatorName: 'user1',
            creatorPass: 'mySimplePassword1'
        },

        blinger: {
            adminId: "1420959",
            adminTel: "79857293807",
            apiToken: "b98a079f9530d84131c910b2c2cff905"
        },

    },
    leonid: {
        etherium: {
            contractAddress: "0xc77Dea12f8a66d96Ac06e8A8f793209cc4f110b7",
            creatorName: 'user1',
            creatorPass: 'mySimplePassword1'
        },

        blinger: {
            adminId: "1443772",
            adminTel: "79262799971",
            apiToken: "60c84caf05e93d5781ab2ca99413f8e9"
        }
    }
};

function selectProfile() {

    if (!process.env.PROFILE || !configs[process.env.PROFILE]) {
        console.log("Set PROFILE environment variable [konst, leonid]");
        process.exit();
    }
    console.log(`Profile "${process.env.PROFILE}" is applied`);
    cfg = configs[process.env.PROFILE];

    return _.merge({}, configs.defaults, cfg);
}

module.exports = selectProfile();