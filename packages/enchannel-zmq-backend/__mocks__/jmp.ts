import { EventEmitter } from "events";
import * as jmp from "jmp";

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

interface MessageProperties {
  idents: any[];
  header: object;
  parent_header: object;
  metadata: object;
  content: object;
  buffers: Uint8Array | null;
}

class Message {
  idents: any[];
  header: object;
  parent_header: object;
  metadata: object;
  content: object;
  buffers: Uint8Array | null;

  constructor(properties: Partial<MessageProperties>) {
    this.idents = (properties && properties.idents) || [];
    this.header = (properties && properties.header) || {};
    this.parent_header = (properties && properties.parent_header) || {};
    this.metadata = (properties && properties.metadata) || {};
    this.content = (properties && properties.content) || {};
    this.buffers = (properties && properties.buffers) || new Uint8Array();
  }
}

export { Message, Socket };
