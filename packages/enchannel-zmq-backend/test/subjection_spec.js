const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

import { EventEmitter } from 'events';

import * as jmp from 'jmp';

import {
  deepFreeze,
  createObserver,
  createObservable,
} from '../src/subjection';

describe('deepFreeze', () => {
  it('should Object.freeze nested objects', () => {
    const obj = {
      a: 1,
      b: {
        bb: {
          c: 3,
        },
      },
    };

    deepFreeze(obj);

    expect((() => {obj.a = 2;})).to.throw('Cannot assign to read only property');
    expect((() => {obj.b.bb.c = 42;})).to.throw('Cannot assign to read only property');
    expect((() => {obj.d = 12;})).to.throw('Can\'t add property d, object is not extensible');
  });
});

describe('createObserver', () => {
  it('creates an observer from a socket', () => {
    const hokeySocket = {
      send: sinon.spy(),
      removeAllListeners: sinon.spy(),
      close: sinon.spy(),
    };

    const ob = createObserver(hokeySocket);
    const message = { content: { x: 2 } };
    ob.onNext(message);
    expect(hokeySocket.send).to.have.been.calledWith(new jmp.Message(message));
  });
  it('removes all listeners and closes the socket onCompleted', () => {
    const hokeySocket = {
      send: sinon.spy(),
      removeAllListeners: sinon.spy(),
      close: sinon.spy(),
    };

    const ob = createObserver(hokeySocket);
    ob.onCompleted();
    expect(hokeySocket.removeAllListeners).to.have.been.calledWith();
    expect(hokeySocket.close).to.have.been.calledWith();
  });
  it('should only close once', () => {
    const hokeySocket = {
      send: sinon.spy(),
      removeAllListeners: sinon.spy(),
      close: sinon.spy(),
    };

    const ob = createObserver(hokeySocket);
    ob.onCompleted();
    expect(hokeySocket.removeAllListeners).to.have.been.calledWith();
    expect(hokeySocket.close).to.have.been.calledWith();

    hokeySocket.removeAllListeners = sinon.spy();
    hokeySocket.close = sinon.spy();
    ob.onCompleted();
    expect(hokeySocket.removeAllListeners).to.not.have.been.calledWith();
    expect(hokeySocket.close).to.not.have.been.calledWith();
  });
});

describe('createObservable', () => {
  it('publishes clean enchannel messages', (done) => {
    const emitter = new EventEmitter();
    const obs = createObservable(emitter);

    obs.subscribe(msg => {
      expect(msg).to.deep.equal({
        content: {
          success: true,
        },
      });
      done();
    });
    const msg = {
      idents: [],
      signatureOK: true,
      blobs: [],
      content: {
        success: true,
      },
    };
    emitter.emit('message', msg);
  });
  it('publishes deeply frozen objects', (done) => {
    const emitter = new EventEmitter();
    const obs = createObservable(emitter);

    obs.subscribe(msg => {
      expect(Object.isFrozen(msg)).to.be.true;
      expect(Object.isFrozen(msg.content)).to.be.true;
      done();
    });
    const msg = {
      idents: [],
      signatureOK: true,
      blobs: [],
      content: {
        success: true,
      },
    };
    emitter.emit('message', msg);
  });
});
