const routes = require('../routes')

async function handleRoutes(req, res) {
    const providedUrl = req.url
    if(providedUrl) {
        const [basePath] = providedUrl.match(/\/[^\\\/]*/g)
        const route = routes[basePath]
        if (route) {
            await route(req, res)
        }
    }

    res.statusCode = 404
    res.end()
}

module.exports = handleRoutes
