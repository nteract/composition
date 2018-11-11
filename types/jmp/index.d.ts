// jmp does not publish type definitions. Provide a skeleton here just to
// keep TS happy
declare module "jmp" {
  import zmq from "zeromq";

  interface MessageProperties {
    idents: any[];
    header: object;
    parent_header: object;
    metadata: object;
    content: object;
    buffers: any[] | null;
  }

  export class Message {
    constructor(properties?: Partial<MessageProperties>);

    idents: any[];
    header: object;
    parent_header: object;
    metadata: object;
    content: object;
    buffers: any[];

    respond(
      socket: Socket,
      messageType: string,
      content?: object,
      metadata?: object,
      protocolVersion?: string
    ): Message;
  }

  export class Socket extends zmq.Socket {
    constructor(socketType: string | number, scheme?: string, key?: string);

    type: string;

    send(message: Message | string | Buffer | any[], flags?: number): this;

    emit(type: string, data?: any): this;

    // actually provided by zeromq but types are wrong
    unmonitor(): this;

    removeAllListeners(): this;
  }
}
