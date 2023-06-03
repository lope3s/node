const { readFile } = require('node:fs/promises')
const getFile = require('./getFile')

async function readCSVFile() {
    const file = await getFile()

    const data = await readFile(file, { encoding: 'utf8' })

    const [headers, ...values] = data.trim().split('\n')

    const parsedHeaders = headers.trim().split(',')

    const result = []

    for (const value of values) {
        const dataObj = {}

        const parsedValue = value.trim().split(',')

        for (index in parsedHeaders) {
            dataObj[parsedHeaders[index]] = parsedValue[index]
        }
        result.push(dataObj)
    }

    await file.close()

    return result
}

module.exports = readCSVFile
