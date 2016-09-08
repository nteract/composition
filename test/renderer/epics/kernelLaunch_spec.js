import { expect } from 'chai';

const Rx = require('rxjs/Rx');

const EventEmitter = require('events');

import { ActionsObservable } from 'redux-observable';

import * as constants from '../../../src/notebook/constants';

import {
  setLanguageInfo,
  acquireKernelInfo,
  newKernelObservable,
  watchExecutionStateEpic,
} from '../../../src/notebook/epics/kernelLaunch';

import {
  createMessage,
} from '../../../src/notebook/kernel/messaging';

describe('setLanguageInfo', () => {
  it('creates a SET_LANGUAGE_INFO action', () => {
    const langInfo = {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name":"python",
      "nbconvert_exporter":"python",
      "pygments_lexer":"ipython3",
      "version":"3.5.1",
    };

    expect(setLanguageInfo(langInfo)).to.deep.equal({
      type: constants.SET_LANGUAGE_INFO,
      langInfo: langInfo,
    });
  })
});

describe('acquireKernelInfo', () => {
  it('sends a kernel_info_request and processes kernel_info_reply', (done) => {
    const fakeMessage = {
      parent_header: {
        msg_id: '0',
      },
      header: {
        msg_id: '1',
      },
    }

    const sent = new Rx.Subject();
    const received = new Rx.Subject();

    const mockSocket = Rx.Subject.create(sent, received);

    sent.subscribe((msg) => {
      expect(msg.header.msg_type).to.equal('kernel_info_request');

      const response = createMessage('kernel_info_reply');
      response.parent_header = msg.header;
      response.content = {
        language_info: {
          'language': 'python',
        }
      }

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    })

    const obs = acquireKernelInfo({shell: mockSocket});

    obs.subscribe((langAction) => {
      expect(langAction).to.deep.equal({
        'langInfo': {'language': 'python'},
        type: 'SET_LANGUAGE_INFO'
      })
      done();
    });
  });
});

describe.only('newKernelObservable', () => {
  it('returns an Observable with a subscribe', () => {
    const obs = newKernelObservable('python2', '~');
    expect(obs).to.have.property('subscribe');
  });
  it('finishes a subscription cycle', (done) => {
    const obs = newKernelObservable('python2', '~');
    const noop = () => {};
    obs.subscribe(noop, noop, done);
  });
});

describe('watchExecutionStateEpic', () => {
  it('returns an Observable with an initial state of idle', () => {
    const action$ = new ActionsObservable();
    const obs = watchExecutionStateEpic(action$);
    expect(obs).to.have.property('subscribe');
  })
})
