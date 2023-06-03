//http.Server
//http.ClientRequest
//hhtp.IncomingMessage -> request
//http.ServerResponse -> response

const http = require('node:http')

//To handle the requests made to your server you can add a cbFn to createServer;
const server = http.createServer((req, res) => {
    if(req.url === '/') {
        res.write('Hello world')
        res.end()
    }
})

//You can do like this, but this solution is very low level
//server.on('connection', (socket) => {
//    console.log('New connection.')
//})

server.listen(3000)

console.log('listening on port 3000...')
