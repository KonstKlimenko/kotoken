
const configs = {
    konst: {
        etherium: {
            contractAddress: "0xd08D431AeD057dF91c36427Ea140d2a78ab0905A",
            creatorName: 'user1',
            creatoPass: 'mySimplePassword1'
        },

        blinger: {
            adminId: "1420959",
            adminTel: "79857293807",
            apiToken: "b98a079f9530d84131c910b2c2cff905"
        }
    },
    leonid: {
        etherium: {
            contractAddress: "0xc77Dea12f8a66d96Ac06e8A8f793209cc4f110b7",
            creatorName: 'user1',
            creatoPass: 'mySimplePassword1'
        },

        blinger: {
            adminId: "1443772",
            adminTel: "79262799971",
            apiToken: "60c84caf05e93d5781ab2ca994"
        }
    }
}

function selectProfile() {

    if (process.env.PROFILE) {
        if (!configs[process.env.PROFILE]) {
            console.log("Wrong profile is set in PROFILE environment environment");
            process.exit();

        }
        console.log(`Profile "${process.env.PROFILE}" is applied`);
        return configs[process.env.PROFILE]
    } else {
        console.log(`default Profile is applied`)
        return configs["konst"];
    }

}

module.exports = selectProfile();