import { EventEmitter } from "events";

class Socket extends EventEmitter {
  throttle = false;

  constructor(public type: any, public scheme: any, public key: any) {
    super();
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

function Message(properties: { [prop: string]: any }) {
  this.idents = (properties && properties.idents) || [];
  this.header = (properties && properties.header) || {};
  this.parent_header = (properties && properties.parent_header) || {};
  this.metadata = (properties && properties.metadata) || {};
  this.content = (properties && properties.content) || {};
  this.buffers = (properties && properties.buffers) || [];
}

export { Message, Socket };
