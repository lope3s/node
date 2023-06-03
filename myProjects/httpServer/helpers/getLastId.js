const readCSVFile = require('./readCSVFile')

async function getLastId() { 
    const results = await readCSVFile()

    if (results.length) return parseInt(results.at(-1).id)

    return 0
}

module.exports = getLastId
