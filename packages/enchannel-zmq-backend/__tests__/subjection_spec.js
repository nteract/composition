/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

const uuidv4 = require("uuid/v4");

import { EventEmitter } from "events";

import * as constants from "../src/constants";

import * as jmp from "jmp";

import {
  createSubscriber,
  createObservable,
  createSubject,
  createSocket
} from "../src/subjection";

describe("createSubscriber", () => {
  test("creates a subscriber from a socket", () => {
    const hokeySocket = {
      send: jest.fn(),
      removeAllListeners: jest.fn(),
      close: jest.fn()
    };

    const ob = createSubscriber(hokeySocket);
    const message = { content: { x: 2 } };
    ob.next(message);
    expect(hokeySocket.send).toBeCalledWith(new jmp.Message(message));
  });
  test("removes all listeners and closes the socket on complete()", () => {
    const hokeySocket = {
      send: jest.fn(),
      removeAllListeners: jest.fn(),
      close: jest.fn()
    };

    const ob = createSubscriber(hokeySocket);
    ob.complete();
    expect(hokeySocket.removeAllListeners).toBeCalled();
    expect(hokeySocket.close).toBeCalled();
  });
  test("should only close once", () => {
    const hokeySocket = {
      send: jest.fn(),
      removeAllListeners: jest.fn(),
      close: jest.fn()
    };

    const ob = createSubscriber(hokeySocket);
    ob.complete();
    expect(hokeySocket.removeAllListeners).toBeCalled();
    expect(hokeySocket.close).toBeCalled();

    hokeySocket.removeAllListeners = jest.fn();
    hokeySocket.close = jest.fn();
    ob.complete();
    expect(hokeySocket.removeAllListeners).not.toBeCalled();
    expect(hokeySocket.close).not.toBeCalled();
  });
});

describe("createObservable", () => {
  test("publishes clean enchannel messages", done => {
    const emitter = new EventEmitter();
    const obs = createObservable(emitter);

    obs.subscribe(msg => {
      expect(msg).toEqual({ content: { success: true }, blobs: [] });
      done();
    });
    const msg = { blobs: [], content: { success: true } };
    emitter.emit("message", msg);
  });
});

describe("createSubject", () => {
  test("creates a subject that can send and receive", done => {
    // This is largely captured above, we make sure that the subject gets
    // created properly
    const hokeySocket = new EventEmitter();

    hokeySocket.removeAllListeners = jest.fn();
    hokeySocket.send = jest.fn();
    hokeySocket.close = jest.fn();

    const s = createSubject(hokeySocket);

    s.subscribe(msg => {
      expect(msg).toEqual({ content: { success: true }, blobs: [] });
      s.complete();
      expect(hokeySocket.removeAllListeners).toBeCalled();
      expect(hokeySocket.close).toBeCalled();
      done();
    });
    const msg = { idents: [], blobs: [], content: { success: true } };

    const message = { content: { x: 2 } };
    s.next(message);
    expect(hokeySocket.send).toBeCalledWith(new jmp.Message(message));

    hokeySocket.emit("message", msg);
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
