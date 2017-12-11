# voidswarm-discovery

## Usage

```js
const Discovery = require('voidswarm-discovery')

const discovery = new Discovery({ // default options
  name: 'voidswarm',
  version: require('./package.json').version,
  port: 59544,
  address: '255.255.255.255',
  blacklist: [],
  interval: 250,
  noAnnounce: false
})

d.on('discovered', (address) => console.log('discovered', address))
d.on('timeout', (address) => console.log('timeout', address))
```