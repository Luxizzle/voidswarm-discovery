const EventEmitter = require("events").EventEmitter;
const dgram = require("dgram");
const localIp = require("my-local-ip");

const defaultOptions = {
  name: "voidswarm",
  version: require("./package.json").version,
  port: 59544,
  address: "255.255.255.255",
  blacklist: [],
  interval: 200,
  noAnnounce: false
};

module.exports = class VoidswarmDiscovery extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = Object.assign({}, defaultOptions, options);
    this.options.blacklist.push(localIp());

    this.identifier = [this.options.name, this.options.version].join("\0");

    this.nodes = new Set();
    this.nodesTimeout = new Map();

    this.socket = dgram.createSocket("udp4");

    this.socket.on("message", this.onMessage.bind(this));

    this.socket.bind(this.options.port, () => {
      this.socket.setBroadcast(true);
      this.emit("ready");
    });

    if (this.options.noAnnounce === false) {
      this.announceInterval = setInterval(
        this.announce.bind(this),
        this.options.interval
      );
    }
  }

  onMessage(message, remote) {
    const address = remote.address;
    if (this.options.blacklist.indexOf(address) !== -1) return;

    if (message.toString() === this.identifier) {
      if (this.nodes.has(address)) {
        clearTimeout(this.nodesTimeout.get(address));
        this.nodesTimeout.set(
          address,
          setTimeout(
            this.timeout.bind(this),
            this.options.interval * 2,
            address
          )
        );
      } else {
        this.nodes.add(address);
        this.nodesTimeout.set(
          address,
          setTimeout(
            this.timeout.bind(this),
            this.options.interval * 2,
            address
          )
        );
        this.emit("discovered", address);
      }
    }
  }

  announce() {
    const message = new Buffer(this.identifier);

    this.socket.send(
      message,
      0,
      message.length,
      this.options.port,
      this.options.address
    );
  }

  timeout(address) {
    if (this.nodes.has(address)) {
      this.nodes.delete(address);
      this.nodesTimeout.delete(address);
      this.emit("timeout", address);
    }
  }

  close() {
    clearInterval(this.announceInterval);
    this.socket.close();
    this.emit("close");
    this.removeAllListeners();
  }
};
