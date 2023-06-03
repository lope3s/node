const readCSVFile = require('../helpers/readCSVFile')
const { writeFile, appendFile } = require('node:fs/promises')
const { CSV_HEADERS, FILE_PATH } = require('../configs/csvHeaders')
const getCSVString = require('../helpers/getCSVString')

async function destroy(req, res) {
    const { id } = req.params

    const contacts = await readCSVFile()

    await writeFile(FILE_PATH, `${CSV_HEADERS.join(',')}\n`)

    for (const contact of contacts) {
        if (contact.id !== id) {
            await appendFile(FILE_PATH, getCSVString(contact, CSV_HEADERS))
        }
    }

    res.statusCode = 204
    res.end()
}

module.exports = {
    destroy
}

