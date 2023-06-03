const http = require('node:http')
const getRequestBody = require('./helpers/getRequestBody')
const handleRoute = require('./helpers/handleRoutes')

const server = http.createServer(async(req, res) => {
    const body = await getRequestBody(req)

    req.body = body

    handleRoute(req, res)
});

server.listen(3000)

console.log('Listening on 3000')
