import uuidv4 from "uuid/v4";
import { Subject } from "rxjs";

const EventEmitter = require("events");

import { toArray, take, map } from "rxjs/operators";

import {
  createSocket,
  ZMQType,
  getUsername,
  createMainChannelFromSockets,
  verifiedConnect
} from "../src";

describe("createSocket", () => {
  test("creates a JMP socket on the channel with identity", async function(done) {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      iopub_port: 9009
    };
    const identity = uuidv4();

    const socket = await createSocket("iopub", identity, config);
    expect(socket).not.toBeNull();
    expect(socket.identity).toBe(identity);
    expect(socket.type).toBe(ZMQType.frontend.iopub);
    socket.close();

    done();
  });
});

describe("verifiedConnect", () => {
  test("verifiedConnect monitors the socket", async function(done) {
    const emitter = new EventEmitter();

    const socket = {
      monitor: jest.fn(),
      unmonitor: jest.fn(),
      close: jest.fn(),
      on: jest.fn(emitter.on.bind(emitter)),
      emit: jest.fn(emitter.emit.bind(emitter)),
      connect: jest.fn(() => {})
    };

    const p = verifiedConnect(socket, "tcp://127.0.0.1:8945");
    expect(socket.monitor).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledWith("tcp://127.0.0.1:8945");
    expect(socket.unmonitor).toHaveBeenCalledTimes(0);

    // Test that we unmonitor after connected
    socket.emit("connect");

    const connected = await p;
    expect(socket.unmonitor).toHaveBeenCalledTimes(1);

    done();
  });

  test("verifiedConnect monitors the socket properly even on fast connect", async function(done) {
    const emitter = new EventEmitter();

    const socket = {
      monitor: jest.fn(),
      unmonitor: jest.fn(),
      close: jest.fn(),
      on: jest.fn(emitter.on.bind(emitter)),
      emit: jest.fn(emitter.emit.bind(emitter)),
      connect: jest.fn(() => {
        emitter.emit("connect");
      })
    };

    const p = verifiedConnect(socket, "tcp://127.0.0.1:8945");
    expect(socket.monitor).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.unmonitor).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledWith("tcp://127.0.0.1:8945");
    done();
  });
});

describe("getUsername", () => {
  test("relies on environment variables for username with a specific ordering", () => {
    expect(getUsername()).toEqual("username");

    process.env.USERNAME = "TEST1";
    expect(getUsername()).toEqual("TEST1");
    process.env.LNAME = "TEST2";
    expect(getUsername()).toEqual("TEST2");
    process.env.USER = "TEST3";
    expect(getUsername()).toEqual("TEST3");
    process.env.LOGNAME = "TEST4";
    expect(getUsername()).toEqual("TEST4");
  });

  test(`when no environment variables are set, use literally 'username', which
      comes from the classic jupyter notebook`, () => {
    expect(getUsername()).toEqual("username");
  });

  beforeEach(() => {
    delete process.env.LOGNAME;
    delete process.env.USER;
    delete process.env.LNAME;
    delete process.env.USERNAME;
  });

  afterEach(() => {
    delete process.env.LOGNAME;
    delete process.env.USER;
    delete process.env.LNAME;
    delete process.env.USERNAME;
  });
});

describe("createMainChannelFromSockets", () => {
  test("basic creation", () => {
    const sockets = {
      hokey: {}
    };
    // TODO: This shouldn't work silently if the socket doesn't actually behave
    // like an actual socket
    // NOTE: RxJS doesn't error with the fromEvent until there is at least one
    //       subscriber, which also tells me we might have the wrong behavior
    //       here as it should go ahead and subscribe unconditionally...
    const channels = createMainChannelFromSockets(sockets);

    expect(channels).toBeInstanceOf(Subject);
  });

  test("simple one channel message passing from 'socket' to channels", () => {
    const hokeySocket = new EventEmitter();
    const sockets = {
      shell: hokeySocket
    };

    const channels = createMainChannelFromSockets(sockets);
    expect(channels).toBeInstanceOf(Subject);

    const messages = [{ a: 1 }, { a: 2 }, { b: 3 }];

    const p = channels
      .pipe(
        take(messages.length),
        toArray()
      )
      .toPromise();

    for (var message of messages) {
      hokeySocket.emit("message", message);
    }

    return p.then(modifiedMessages => {
      expect(modifiedMessages).toEqual(
        messages.map(msg => Object.assign({}, msg, { channel: "shell" }))
      );
    });
  });

  test("handles multiple socket routing underneath", () => {
    const shellSocket = new EventEmitter();
    const iopubSocket = new EventEmitter();
    const sockets = {
      shell: shellSocket,
      iopub: iopubSocket
    };

    const channels = createMainChannelFromSockets(sockets);

    const p = channels
      .pipe(
        take(2),
        toArray()
      )
      .toPromise();

    shellSocket.emit("message", { yolo: false });
    iopubSocket.emit("message", { yolo: true });

    return p.then(modifiedMessages => {
      expect(modifiedMessages).toEqual([
        { channel: "shell", yolo: false },
        { channel: "iopub", yolo: true }
      ]);
    });
  });

  test("propagates header information through", () => {
    // Mock a jmp socket
    class HokeySocket extends EventEmitter {
      constructor() {
        super();
        this.send = jest.fn();
      }
      send() {}
    }

    const shellSocket = new HokeySocket();
    const iopubSocket = new HokeySocket();
    const sockets = {
      shell: shellSocket,
      iopub: iopubSocket
    };

    const channels = createMainChannelFromSockets(sockets, {
      session: "spinning",
      username: "dj"
    });

    const p = channels
      .pipe(
        take(2),
        toArray()
      )
      .toPromise();

    channels.next({ channel: "shell" });

    expect(shellSocket.send).toHaveBeenCalledWith({
      buffers: [],
      content: {},
      header: {
        session: "spinning",
        username: "dj"
      },
      idents: [],
      metadata: {},
      parent_header: {}
    });

    channels.next({
      channel: "shell",
      content: {
        applesauce: "mcgee"
      },
      header: {
        msg_id: "XYZ",

        // NOTE: we'll be checking that we use the set username for the
        //       channels, no overrides
        username: "kitty"
      }
    });

    expect(shellSocket.send).toHaveBeenLastCalledWith({
      buffers: [],
      content: {
        applesauce: "mcgee"
      },
      header: {
        session: "spinning",
        username: "dj",
        msg_id: "XYZ"
      },
      idents: [],
      metadata: {},
      parent_header: {}
    });

    shellSocket.emit("message", { yolo: false });
    iopubSocket.emit("message", { yolo: true });

    return p.then(modifiedMessages => {
      expect(modifiedMessages).toEqual([
        { channel: "shell", yolo: false },
        { channel: "iopub", yolo: true }
      ]);
    });
  });
});
