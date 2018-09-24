const _ = require("lodash");

const configs = {

    defaults: {
        etherium: {
            tokenName:'KAT',
            networkId: 3, //ropsten
            etherscanAddress:"https://ropsten.etherscan.io/address",
            ethToUsers:"0.0005",
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

    let cfg = configs["konst"];

    if (process.env.PROFILE) {
        if (!configs[process.env.PROFILE]) {
            console.log("Wrong profile is set in PROFILE environment environment");
            process.exit();

        }
        console.log(`Profile "${process.env.PROFILE}" is applied`);
        cfg = configs[process.env.PROFILE]
    } else {
        console.log(`default Profile is applied`)
    }

    return _.merge({}, configs.defaults, cfg);
}

module.exports = selectProfile();