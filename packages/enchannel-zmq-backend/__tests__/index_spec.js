import uuidv4 from "uuid/v4";
import { Subject } from "rxjs/Subject";

import {
  createSocket,
  ZMQType,
  getUsername,
  createMainChannelFromSockets
} from "../src";

describe.skip("createMainChannel", () => {
  test("pipes messages to socket appropriately", () => {
    // outward to the socket
    const sent = new Subject();
    // coming from the socket
    const received = new Subject();

    const shell = Subject.create(sent, received);

    const channel = createMainChannelFromChannels(
      { shell },
      { session: "1234", username: "jovyan" }
    );

    // We test that our socket got the formed message
    sent.subscribe(value => {
      expect(value).toEqual({
        a: "b",
        channel: "shell",
        header: { session: "1234", username: "jovyan", msg_id: "789AB" }
      });
    });

    channel.next({
      a: "b",
      channel: "shell",
      // msg_id should stay, session should get written over
      header: { msg_id: "789AB", session: "XYZ" }
    });
  });

  test("routes messages appropriately", () => {
    // outward to the socket
    const sent = new Subject();
    // coming from the socket
    const received = new Subject();

    const shell = Subject.create(sent, received);

    const channel = createMainChannelFromChannels(
      { shell },
      { session: "1234", username: "jovyan" }
    );

    channel.subscribe(value => {
      expect(value).toEqual({
        a: "b",
        // mostly checking that the right channel was set
        channel: "shell",
        header: { msg_id: "KERNEL_MESSAGE1", session: "HAPPY" }
      });
    });

    // Live from the socket
    received.next({
      a: "b",
      header: { msg_id: "KERNEL_MESSAGE1", session: "HAPPY" }
    });
  });
});

describe("createSocket", () => {
  test("creates a JMP socket on the channel with identity", () => {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      iopub_port: 9009
    };
    const identity = uuidv4();

    const socket = createSocket("iopub", identity, config);
    expect(socket).not.toBeNull();
    expect(socket.identity).toBe(identity);
    expect(socket.type).toBe(ZMQType.frontend.iopub);
    socket.close();
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
    const channels = createMainChannelFromSockets(sockets);

    expect(channels).toBeInstanceOf(Subject);
  });
});
