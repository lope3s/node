const getFile = require('../helpers/getFile')
const {appendFile} = require('node:fs/promises')
const {EDITABLE_HEADERS, FILE_PATH} = require('../configs/csvHeaders')
const getLastId = require('../helpers/getLastId')

async function store(req, res) {
    const {name, phone} = req.body

    if (!name || !phone) {
        res.statusCode = 400
        res.write(JSON.stringify({error: 'name and phone are required in the request body'}))
        res.end()
        return
    }

    const file = await getFile()

    const data = []

    const lastId = await getLastId()

    const newId = lastId + 1

    data.push(newId)

    for (const header of EDITABLE_HEADERS) {
        data.push(req.body[header].trim())
    }

    await appendFile(FILE_PATH, `${data.join(',')}\n`)

    await file.close()
    res.statusCode = 201
    res.write(JSON.stringify({id: newId, name: req.body.name, phone: req.body.phone}))
    res.end()
}

module.exports = {
    store
}
