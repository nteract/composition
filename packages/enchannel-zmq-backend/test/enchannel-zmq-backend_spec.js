/* eslint camelcase: 0 */ // <-- Per Jupyter message spec

import {
  createIOPubSubject,
  createShellSubject,
} from '../src';

import { AnonymousSubject } from 'rx';

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
        expect(s).to.be.an.instanceof(AnonymousSubject);
        s.close();
        done();
      });
    });
  });
});

describe('createShellSubject', () => {
  it('allows for sending messages on the shell channel', (done) => {
    const scheme = 'sha256';
    const key = '5ca1ab1e-c0da-aced-cafe-c0ffeefacade';
    const kernel = new jmp.Socket('router', scheme, key);

    getPort((err, port) => {
      if(err) {
        throw err;
      }
      const address = `tcp://127.0.0.1:${port}`;

      kernel.bind(address, () => {
        const config = {
          ip: '127.0.0.1',
          transport: 'tcp',
          signature_scheme: 'hmac-sha256',
          shell_port: port,
        };
        const s = createShellSubject(config);
        expect(s).to.be.an.instanceof(AnonymousSubject);

        kernel.on('message', (msg) => {
          console.log(msg);
          msg.respond(kernel, 'kernel_info_reply', {}, {});
        });

        s.subscribe(x => {
          expect(x).to.equal(2);
          s.close();
          done();
        });

        s.send({
          header: {
            msg_id: '00000',
            username: 'faker',
            session: '00000',
            msg_type: 'kernel_info_request',
            version: '5.0',
          },
          parent_header: {},
          metadata: {},
          content: {},
        });

      });
    });
  });
});
