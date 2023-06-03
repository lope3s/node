const RegisterContactsController = require('../controllers/RegisterContactController')

async function registerRoute(req, res) {
    if (req.method === 'POST') {
        return RegisterContactsController.store(req, res)
    }
}

module.exports = registerRoute
