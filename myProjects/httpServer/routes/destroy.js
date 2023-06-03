const DeleteContactController = require('../controllers/DeleteContactController')

async function deleteRoute(req, res) {
    const [basePath, ...subPaths] = req.url.match(/\/[^\/]/g);

    if (req.method === 'DELETE') {
        if (subPaths.length) {
            const param = subPaths[0].substring(1);
            req.params = { id: param }
            return DeleteContactController.destroy(req, res)
        }
    }
}

module.exports = deleteRoute


