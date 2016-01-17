/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import {
  createIOPubSubject,
} from '../src';

import { Subject } from 'rx';

import * as jmp from 'jmp';
import { getPort } from 'portfinder';

import { expect } from 'chai';

describe('createIOPubSubject', () => {
  it('returns an Rx.Subject', (done) => {
    const scheme = 'sha256';
    const key = '5ca1ab1e-c0da-aced-cafe-c0ffeefacade';

    const pub = new jmp.Socket('pub', scheme, key);
    getPort((err, port) => {
      if(err) {
        throw err;
      }
      const address = `tcp://127.0.0.1:${port}`;

      pub.bind(address, () => {
        const config = {
          ip: '127.0.0.1',
          transport: 'tcp',
          signature_scheme: 'hmac-sha256',
          iopub_port: port,
        };
        const s = createIOPubSubject(config);
        expect(s).to.be.an.instanceof(Subject);
        done();
      });
    });
  });
});
