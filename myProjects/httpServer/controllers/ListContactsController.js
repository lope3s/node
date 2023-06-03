const readCSVFile = require('../helpers/readCSVFile')

async function index(req, res) {
    const results = await readCSVFile()

    res.statusCode = 200
    res.write(JSON.stringify({results}))
    res.end()
}

async function show(req, res) {
    const results = await readCSVFile()

    const contact = results.find(result => result.id === req.params.id)

    if (contact) {
        res.statusCode = 200
        res.write(JSON.stringify(contact))
        res.end()
        return
    }
    
        res.statusCode = 404
        res.write(JSON.stringify({error: 'contact not found.'}))
        res.end()
    
}

module.exports = {
    index,
    show
}

