const ListContactsController = require('../controllers/ListContactsController')

async function listRoute(req, res) {
    const [basePath, ...subPaths] = req.url.match(/\/[^\/]/g);

    if (req.method === 'GET') {
        if (!subPaths.length) {
            return ListContactsController.index(req, res)
        }

        if (subPaths.length) {
            const param = subPaths[0].substring(1);
            req.params = { id: param }
            return ListContactsController.show(req, res)
        }
    }
}

module.exports = listRoute

