import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject
} from "..";

import uuidv4 from "uuid/v4";
import { Subject } from "rxjs/Subject";

import { createMainChannelFromChannels, createMainChannel } from "../src";

// Solely testing the exported interface on the built ES5 JavaScript
describe("the built version of enchannel-zmq-backend", () => {
  test("exports create helpers for control, stdin, iopub, and shell", () => {
    expect(createControlSubject).toBeDefined();
    expect(createStdinSubject).toBeDefined();
    expect(createIOPubSubject).toBeDefined();
    expect(createShellSubject).toBeDefined();
  });
});

describe("createMainChannel", () => {
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
    expect(socket.type).toBe(constants.ZMQType.frontend.iopub);
    socket.close();
  });
});
