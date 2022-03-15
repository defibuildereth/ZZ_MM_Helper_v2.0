import * as fs from 'fs';
import fetch from 'node-fetch';

let bestMarkets = []

fs.readFile('allPairs.json', (err, data) => {

    let promiseArray = []

    if (err) throw err;

    let info = JSON.parse(data);
    for (let i = 0; i < info.length; i++) {
        let ending = info[i].apiQuery
        let base = "https://api.cryptowat.ch/pairs/"
        let apiSearchUrl = base.concat(ending)
        promiseArray.push({'apiSearchUrl':apiSearchUrl, 'pair':info[i].pair});
    }
    runApiQuery(promiseArray)
        .then(() => console.log(bestMarkets))
})

const runApiQuery = async function (array) {
    for (let i = 0; i < array.length; i++) {
        await fetch(array[i].apiSearchUrl)
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    // console.log('poop', data.error)
                    return
                } else {
                    // console.log(data.result.markets)
                    selectBestMarket(data.result.markets)
                        .then((res) => {
                            console.log(res, array[i].pair)
                            bestMarkets.push({'info':res, 'pair':array[i].pair})
                            // console.log(bestMarkets)
                        })

                    // for (let i = 0; i < data.result.markets.length; i++) {
                    //     if (data.result.markets[i].active) {
                    //         // console.log(data.result.markets[i])
                    //         newArray.push(data.result.markets[i]);
                    //     }
                    // }

                    // console.log(data.result.markets)
                }
            })
    }
    fs.writeFileSync(`newMarkets.json`, JSON.stringify(bestMarkets));
}


const selectBestMarket = async function (array) {

    let maxVol = 0
    let secondVol = 0
    let bestId;
    let secondId;
    // console.log('running selectBest with ', array)
    for (let i = 0; i < array.length; i++) {
        if (array[i].active) {
            await fetch(`https://api.cryptowat.ch/markets/${array[i].exchange}/${array[i].pair}/summary`)
                .then(r => r.json())
                .then(res => {
                    if (res.result.volume > maxVol) {
                        secondVol = maxVol
                        secondId = bestId
                        maxVol = res.result.volume
                        bestId = array[i].id
                    } else if (res.result.volume > secondVol) {
                        secondVol = res.result.volume
                        secondId = array[i].id
                    }
                })
        }
    }
    console.log(array[0].pair, bestId, secondId)
    return ({ 'pair': array[0].pair, 'id': bestId, 'id2': secondId })
}