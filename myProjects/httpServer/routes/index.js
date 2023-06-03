const registerRoute = require('./register')
const listRoute = require('./list')
const deleteRoute = require('./destroy')
const updateRoute = require('./update')

const routes = {
    '/register': registerRoute,
    '/list': listRoute,
    '/delete': deleteRoute,
    '/update': updateRoute
}

module.exports = routes
