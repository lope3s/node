const readCSVFile = require('../helpers/readCSVFile')
const { writeFile, appendFile } = require('node:fs/promises')
const { CSV_HEADERS, FILE_PATH, EDITABLE_HEADERS } = require('../configs/csvHeaders')
const getCSVString = require('../helpers/getCSVString')

async function update(req, res) {
    const { id } = req.params

    const contacts = await readCSVFile()

    await writeFile(FILE_PATH, `${CSV_HEADERS.join(',')}\n`)

    let updatedContact;

    for (const contact of contacts) {
        if (contact.id === id) {

            for (const edHeader of EDITABLE_HEADERS) {
                if (req.body[edHeader]) {
                    contact[edHeader] = req.body[edHeader]
                    updatedContact = contact
                }
            }

            await appendFile(FILE_PATH, getCSVString(contact, CSV_HEADERS))


            continue
        }
        await appendFile(FILE_PATH, getCSVString(contact, CSV_HEADERS))
    }

    if (updatedContact) {
        res.statusCode = 200
        res.write(JSON.stringify(updatedContact))
        res.end()
        return
    }

    res.statusCode = 404
    res.write(JSON.stringify({ error: 'contato não encontrado' }))
    res.end()
}

module.exports = {
    update
}


