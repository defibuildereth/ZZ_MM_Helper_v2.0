import * as fs from 'fs';


const file = fs.readFile('./allpairs', function (err, f) {
    let array = []


    let items = JSON.parse(f).args[0];

    for (let i = 0; i < items.length; i++) {
        let r = items[i][0].replace(/[^a-zA-Z]+/g, '');
        array.push({ 'pair': items[i][0], 'apiQuery': r })
    }
    console.log(array)

    let data = JSON.stringify(array, null, 2);
    fs.writeFileSync('pairs.json', data);

});



