var Discovery = require('./index')

var d = new Discovery()

d.on('discovered', (address) => console.log('discovered', address))
d.on('timeout', (address) => console.log('timeout', address))