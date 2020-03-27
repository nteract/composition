declare module "jmp" {
  import zmq from "zeromq";

  export interface MessageProperties {
    idents: any[];
    header: object;
    parent_header: object;
    metadata: object;
    content: object;
    buffers: Uint8Array | null;
  }

  export class Message {
    constructor(properties?: Partial<MessageProperties>);

    idents: any[];
    header: object;
    parent_header: object;
    metadata: object;
    content: object;
    buffers: Uint8Array;

    respond(
      socket: Socket,
      messageType: string,
      content?: object,
      metadata?: object,
      protocolVersion?: string
    ): Message;
  }

  export class Socket extends zmq.Socket {
    type: string | number;

    constructor(socketType: string | number, scheme?: string, key?: string);

    send(message: Message | string | Buffer | any[], flags?: number): this;

    emit(type: string, data?: any): this;

    // actually provided by zeromq but types are wrong
    unmonitor(): this;

    removeAllListeners(): this;

    close(): this;

    // inherited from NodeJS.EventEmitter, but tsc sometimes misses that...
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }
}
