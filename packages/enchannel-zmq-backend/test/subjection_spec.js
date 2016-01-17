const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

import * as jmp from 'jmp';

import {
  deepFreeze,
  createObserver,
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
});
