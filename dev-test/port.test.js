const net = require('net')
const { randomInt } = require('crypto')

const portCheck = (port, fn) => {
    const tester = net.createServer()
        .once('error', err => {
            if (err.code != 'EADDRINUSE') return fn('address in use')
            fn(true)
        })
        .once('listening', () => {
            tester.once('close', () => {
                fn('address is free')
            })
                .close()
        })
        .listen(port)
}

function state(param) {
    console.log(param)
}

portCheck(8080, state);
