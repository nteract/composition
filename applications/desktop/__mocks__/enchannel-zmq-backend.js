jest.resetModules();
jest.mock("zeromq-ng");

// Mock a zeromq socket
class HokeySocket {
  send = jest.fn();
}

module.exports = {
  createMainChannel: function() {
    const {
      createMainChannelFromSockets
    } = require("enchannel-zmq-backend/src");
    const shellSocket = new HokeySocket();
    const iopubSocket = new HokeySocket();
    const sockets = {
      shell: shellSocket,
      iopub: iopubSocket
    };

    const channels = createMainChannelFromSockets(
      { signature_scheme: "hmac-sha256" },
      sockets,
      {
        session: "spinning",
        username: "dj"
      }
    );

    return channels;
  }
};
