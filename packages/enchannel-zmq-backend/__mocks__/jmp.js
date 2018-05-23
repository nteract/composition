const EventEmitter = require("events");
class Socket extends EventEmitter {
  constructor(zmqType, scheme, key) {
    super();
    this.type = zmqType;
    this.scheme = scheme;
    this.key = key;
  }

  monitor() {}
  unmonitor() {}
  connect() {
    if (this.throttle) {
      setTimeout(() => this.emit("connect"), 0);
    } else {
      this.emit("connect");
    }
  }
  close() {}
}

const Message = msg => ({
  header: { ...msg.header },
  parent_header: { ...msg.parent_header },
  content: { ...msg.content },
  metadata: { ...msg.metadata },
  buffers: [],
  idents: []
});

export { Message, Socket };
