/* eslint camelcase: 0 */ // <-- Per Jupyter message spec
import * as uuid from 'uuid';

import { expect } from 'chai';

import {
  createChannelSubject,
  createIOPubSubject,
} from '../src';

import {
  AnonymousSubject,
} from 'rx';

describe('createChannelSubject', () => {
  it('creates a subject for the channel', () => {
    const config = {
      signature_scheme: 'hmac-sha256',
      key: '5ca1ab1e-c0da-aced-cafe-c0ffeefacade',
      ip: '127.0.0.1',
      transport: 'tcp',
      iopub_port: 19009,
    };
    const s = createChannelSubject('iopub', uuid.v4(), config);
    expect(s).to.be.instanceof(AnonymousSubject);
    expect(s.onNext).to.be.a('function');
    expect(s.send).to.be.a('function');
    expect(s.onCompleted).to.be.a('function');
    expect(s.close).to.be.a('function');
    expect(s.subscribe).to.be.a('function');
    s.close();
  });
});

describe('createIOPubSubject', () => {
  it('creates a subject with the default iopub subscription', () => {
    const config = {
      signature_scheme: 'hmac-sha256',
      key: '5ca1ab1e-c0da-aced-cafe-c0ffeefacade',
      ip: '127.0.0.1',
      transport: 'tcp',
      iopub_port: 19011,
    };
    const s = createIOPubSubject(uuid.v4(), config);
    s.close();
  });
});
