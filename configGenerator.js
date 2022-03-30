import * as fs from 'fs';
import fetch from 'node-fetch';

let objects = []

fs.readFile('newMarkets.json', (err, data) => {
    if (err) throw err;
    let allData = JSON.parse(data);
    createConfig(allData)
        .then(() => {
            // console.log(objects)
        })
})

const createConfig = async function (allData) {
    console.log(allData.length)

    let unit;

    for (let i = 0; i < allData.length; i++) {

        let thresholdAmount = 400
        let stablecoinMultiplier = 10
        let minAmount = 1

        let liquidity = 1
        let trueStables = ['USDC', 'USDT', 'DAI', 'UST']

        let id2;

        let key = allData[i].pair

        let regex = /(\w)*(?=-)/g
        let regex2 = /(-)(\w)*/g

        let basePair = allData[i].pair.match(regex)[0]
        let quotePair = allData[i].pair.match(regex2)[0].slice(1)
        await fetch(`https://api.zksync.io/api/v0.2/tokens/${basePair}/priceIn/usd`)
            .then(r => r.json())
            .then(res => {
                unit = res.result.price
            })

        if (allData[i].info.id) {
            if (trueStables.includes(basePair)) {
                if (trueStables.includes(quotePair)) {
                    thresholdAmount = thresholdAmount * stablecoinMultiplier
                    id2 = "constant:1"
                }
            } else if (allData[i].info.id2) {
                id2 = "cryptowatch:" + allData[i].info.id2
            } else {
                id2 = null
                liquidity = 2.5
            }
            let obj = {

                [key]: {
                    "mode": "pricefeed",
                    "side": "d",
                    "priceFeedPrimary": "cryptowatch:" + allData[i].info.id,
                    "priceFeedSecondary": id2,
                    "slippageRate": 2e-6 * unit * liquidity,
                    "maxSize": thresholdAmount / unit / liquidity,
                    "minSize": minAmount / unit,
                    "minSpread": 0.001 * liquidity,
                    "active": true,
                    "delayAfterFill": [30 * liquidity, thresholdAmount / unit / 2],
                    "increaseSpreadAfterFill": [0.0005 * liquidity, 90 * liquidity, thresholdAmount / unit / 3],
                    "changeSizeAfterFill": [-thresholdAmount / unit / liquidity / 3, 60 * liquidity, thresholdAmount / unit / 2.5]
                }
            }
            console.log(JSON.stringify(obj, null, 2) + ",")
            objects.push(JSON.stringify(obj, null, 2) + ",")
        }
    }
}
