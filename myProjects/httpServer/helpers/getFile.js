const { open, writeFile } = require('node:fs/promises')
const { CSV_HEADERS, FILE_PATH } = require('../configs/csvHeaders')

async function getFile() {
    let file;

    try {
        file = await open(FILE_PATH)
    } catch (err) {
        if (err.code === 'ENOENT') {
            await writeFile(FILE_PATH, `${CSV_HEADERS.join(',')}\n`)
            file = await open(FILE_PATH)
        }
    }

    return file
}

module.exports = getFile
