const UpdateContactController = require('../controllers/UpdateContactController')

async function updateRoute(req, res) {
    const [basePath, ...subPaths] = req.url.match(/\/[^\/]/g);

    if (req.method === 'PUT' || req.method === 'PATCH') {
        if (subPaths.length) {
            const param = subPaths[0].substring(1);
            req.params = { id: param }
            return UpdateContactController.update(req, res)
        }
    }
}

module.exports = updateRoute



