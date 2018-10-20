import { createMainChannelFromSockets } from "enchannel-zmq-backend/src";

const EventEmitter = require("events");

// Mock a jmp socket
class HokeySocket extends EventEmitter {
  constructor() {
    super();
    this.send = jest.fn();
  }
  send() {}
}

module.exports = {
  createMainChannel: async function() {
    const shellSocket = new HokeySocket();
    const iopubSocket = new HokeySocket();
    const sockets = {
      shell: shellSocket,
      iopub: iopubSocket
    };

    const channels = await createMainChannelFromSockets(sockets, {
      session: "spinning",
      username: "dj"
    });

    return channels;
  }
};
