import { Subject } from "rxjs";
import { take, toArray } from "rxjs/operators";
import { v4 as uuid } from "uuid";

import {
  createMainChannelFromSockets,
  createSocket,
  getUsername,
  JupyterConnectionInfo,
  verifiedConnect,
  ZMQType
} from "../src";

import { EventEmitter } from "events";
import { Socket as _Socket } from "jmp";
import * as zmq from "zeromq";

type Socket = typeof _Socket &
  zmq.Socket &
  EventEmitter & { unmonitor: Function };

import { JupyterMessage, MessageType } from "@nteract/messaging";

interface Sockets {
  [id: string]: Socket;
}

describe("createSocket", () => {
  test("creates a JMP socket on the channel with identity", async done => {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      iopub_port: 9009
    } as JupyterConnectionInfo;
    const identity = uuid();

    const socket = await createSocket("iopub", identity, config);
    expect(socket).not.toBeNull();
    expect(socket.identity).toBe(identity);
    expect(socket.type).toBe(ZMQType.frontend.iopub);
    socket.close();

    done();
  });
});

describe("verifiedConnect", () => {
  test("verifiedConnect monitors the socket", async done => {
    const emitter = new EventEmitter();

    const socket = ({
      monitor: jest.fn(),
      unmonitor: jest.fn(),
      close: jest.fn(),
      on: jest.fn(emitter.on.bind(emitter)),
      emit: jest.fn(emitter.emit.bind(emitter)),
      connect: jest.fn(() => {})
    } as any) as Socket;

    const p = verifiedConnect(socket, "tcp://127.0.0.1:8945");
    expect(socket.monitor).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.connect).toHaveBeenCalledWith("tcp://127.0.0.1:8945");
    expect(socket.unmonitor).toHaveBeenCalledTimes(0);

    // Test that we unmonitor after connected
    socket.emit("connect");

    await p;
    expect(socket.unmonitor).toHaveBeenCalledTimes(1);

    done();
  });

  test("verifiedConnect monitors the socket properly even on fast connect", async done => {
    const emitter = new EventEmitter();

    const socket = ({
      monitor: jest.fn(),
      unmonitor: jest.fn(),
      close: jest.fn(),
      on: jest.fn(emitter.on.bind(emitter)),
      emit: jest.fn(emitter.emit.bind(emitter)),
      connect: jest.fn(() => {
        emitter.emit("connect");
      })
    } as any) as Socket;

    verifiedConnect(socket, "tcp://127.0.0.1:8945");
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
    const sockets = ({
      hokey: {}
    } as any) as Sockets;
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
    const sockets = ({
      shell: hokeySocket
    } as any) as Sockets;

    const channels = createMainChannelFromSockets(sockets);
    expect(channels).toBeInstanceOf(Subject);

    const messages = [{ a: 1 }, { a: 2 }, { b: 3 }];

    const p = channels
      .pipe(
        take(messages.length),
        toArray()
      )
      .toPromise();

    for (const message of messages) {
      hokeySocket.emit("message", message);
    }

    return p.then((modifiedMessages: any) => {
      expect(modifiedMessages).toEqual(
        messages.map(msg => ({ ...msg, channel: "shell" }))
      );
    });
  });

  test("handles multiple socket routing underneath", () => {
    const shellSocket = new EventEmitter();
    const iopubSocket = new EventEmitter();
    const sockets = ({
      shell: shellSocket,
      iopub: iopubSocket
    } as any) as Sockets;

    const channels = createMainChannelFromSockets(sockets);

    const p = channels
      .pipe(
        take(2),
        toArray()
      )
      .toPromise();

    shellSocket.emit("message", { yolo: false });
    iopubSocket.emit("message", { yolo: true });

    return p.then((modifiedMessages: any) => {
      expect(modifiedMessages).toEqual([
        { channel: "shell", yolo: false },
        { channel: "iopub", yolo: true }
      ]);
    });
  });

  test("propagates header information through", async done => {
    // Mock a jmp socket
    class HokeySocket extends EventEmitter {
      send = jest.fn();
      constructor() {
        super();
        this.send = jest.fn();
      }
    }

    const shellSocket = new HokeySocket();
    const iopubSocket = new HokeySocket();
    const sockets = ({
      shell: shellSocket,
      iopub: iopubSocket
    } as any) as Sockets;

    const channels = createMainChannelFromSockets(sockets, {
      session: "spinning",
      username: "dj"
    });

    const responses = channels
      .pipe(
        take(2),
        toArray()
      )
      .toPromise();

    channels.next({ channel: "shell" } as JupyterMessage<any>);

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
        version: "3",
        msg_type: "random" as MessageType,
        date: new Date().toISOString(),
        msg_id: "XYZ",

        // NOTE: we'll be checking that we use the set username for the
        //       channels, no overrides
        username: "kitty"
      }
    } as JupyterMessage);

    expect(shellSocket.send).toHaveBeenLastCalledWith({
      buffers: [],
      content: {
        applesauce: "mcgee"
      },
      header: {
        msg_type: "random",
        session: "spinning",
        username: "dj",
        msg_id: "XYZ",
        date: expect.any(String),
        version: "3"
      },
      idents: [],
      metadata: {},
      parent_header: {}
    });

    shellSocket.emit("message", { yolo: false });
    iopubSocket.emit("message", { yolo: true });

    const modifiedMessages = await responses;

    expect(modifiedMessages).toEqual([
      { channel: "shell", yolo: false },
      { channel: "iopub", yolo: true }
    ]);

    done();
  });
});
