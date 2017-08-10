/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

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
  it("creates a subscriber from a socket", () => {
    const hokeySocket = {
      send: sinon.spy(),
      removeAllListeners: sinon.spy(),
      close: sinon.spy()
    };

    const ob = createSubscriber(hokeySocket);
    const message = { content: { x: 2 } };
    ob.next(message);
    expect(hokeySocket.send).to.have.been.calledWith(new jmp.Message(message));
  });
  it("removes all listeners and closes the socket on complete()", () => {
    const hokeySocket = {
      send: sinon.spy(),
      removeAllListeners: sinon.spy(),
      close: sinon.spy()
    };

    const ob = createSubscriber(hokeySocket);
    ob.complete();
    expect(hokeySocket.removeAllListeners).to.have.been.calledWith();
    expect(hokeySocket.close).to.have.been.calledWith();
  });
  it("should only close once", () => {
    const hokeySocket = {
      send: sinon.spy(),
      removeAllListeners: sinon.spy(),
      close: sinon.spy()
    };

    const ob = createSubscriber(hokeySocket);
    ob.complete();
    expect(hokeySocket.removeAllListeners).to.have.been.calledWith();
    expect(hokeySocket.close).to.have.been.calledWith();

    hokeySocket.removeAllListeners = sinon.spy();
    hokeySocket.close = sinon.spy();
    ob.complete();
    expect(hokeySocket.removeAllListeners).to.not.have.been.calledWith();
    expect(hokeySocket.close).to.not.have.been.calledWith();
  });
});

describe("createObservable", () => {
  it("publishes clean enchannel messages", done => {
    const emitter = new EventEmitter();
    const obs = createObservable(emitter);

    obs.subscribe(msg => {
      expect(msg).to.deep.equal({
        content: {
          success: true
        },
        blobs: []
      });
      done();
    });
    const msg = {
      blobs: [],
      content: {
        success: true
      }
    };
    emitter.emit("message", msg);
  });
});

describe("createSubject", () => {
  it("creates a subject that can send and receive", done => {
    // This is largely captured above, we make sure that the subject gets
    // created properly
    const hokeySocket = new EventEmitter();

    hokeySocket.removeAllListeners = sinon.spy();
    hokeySocket.send = sinon.spy();
    hokeySocket.close = sinon.spy();

    const s = createSubject(hokeySocket);

    s.subscribe(msg => {
      expect(msg).to.deep.equal({
        content: {
          success: true
        },
        blobs: []
      });
      s.complete();
      expect(hokeySocket.removeAllListeners).to.have.been.calledWith();
      expect(hokeySocket.close).to.have.been.calledWith();
      done();
    });
    const msg = {
      idents: [],
      blobs: [],
      content: {
        success: true
      }
    };

    const message = { content: { x: 2 } };
    s.next(message);
    expect(hokeySocket.send).to.have.been.calledWith(new jmp.Message(message));

    hokeySocket.emit("message", msg);
  });
});

describe("createSocket", () => {
  it("creates a JMP socket on the channel with identity", () => {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      iopub_port: 9009
    };
    const identity = uuidv4();

    const socket = createSocket("iopub", identity, config);
    expect(socket).to.not.be.null;
    expect(socket.identity).to.equal(identity);
    expect(socket.type).to.equal(constants.ZMQType.frontend.iopub);
    socket.close();
  });
});
