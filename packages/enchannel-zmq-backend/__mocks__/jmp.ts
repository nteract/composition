import { EventEmitter } from "events";

class Socket extends EventEmitter {
  constructor(public type: any, public scheme: any, public key: any) {
    super();
  }

  throttle = false;

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

const Message = (msg: any) => ({
  header: { ...msg.header },
  parent_header: { ...msg.parent_header },
  content: { ...msg.content },
  metadata: { ...msg.metadata },
  buffers: [],
  idents: []
});

export { Message, Socket };
