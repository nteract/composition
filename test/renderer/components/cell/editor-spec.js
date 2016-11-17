import React from 'react';

import { mount } from 'enzyme';
import chai, { expect } from 'chai';

import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Rx from 'rxjs/Rx';

import { createMessage } from '../../../../src/notebook/kernel/messaging';

import { dummyStore } from '../../../utils';

import Editor from '../../../../src/notebook/components/cell/editor';

chai.use(sinonChai);


const complete = require('../../../../src/notebook/components/cell/editor/complete');

describe('Editor', () => {
  it('reaches out for code completion', (done) => {
    const sent = new Rx.Subject();
    const received = new Rx.Subject();

    const mockSocket = Rx.Subject.create(sent, received);

    const state = {
      app: {
        channels: {
          shell: mockSocket,
        },
      },
    };
    const store = {
      getState: () => state,
    };

    const editorWrapper = mount(
      <Editor
        completion
      />,
      {
        context: { store },
      }
    );
    expect(editorWrapper).to.not.be.null;

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({line: 12}),
      getValue: () => 'MY VALUE',
      indexFromPos: () => 90001,
    };

    const callback = sinon.spy();

    const completer = sinon.spy(complete, 'codeComplete');
    sent.subscribe(msg => {
      expect(msg.content.code).to.equal('MY VALUE');
      expect(completer).to.have.been.calledWith(state.app.channels, cm);
      completer.restore();
      done();
    });
    editor.completions(cm, callback);
  });
  it('doesn\'t try for code completion when not set', () => {
    const state = {
      app: {
        channels: {
          shell: 'turtle power',
        },
      },
    };
    const store = {
      getState: () => state,
    };

    const editorWrapper = mount(
      <Editor />,
      {
        context: { store },
      }
    );
    expect(editorWrapper).to.not.be.null;

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({line: 12}),
      getValue: () => 'MY VALUE',
      indexFromPos: () => 90001,
    };

    const callback = sinon.spy();

    const completer = sinon.spy(complete, 'codeComplete');
    editor.completions(cm, callback);
    expect(completer).to.have.not.been.called;
    completer.restore();
  });
  it('handles cursor blinkery changes', () => {
	const editorWrapper = mount(
	  <Editor
	  cursorBlinkRate={530}
		/>,
	);
	const instance = editorWrapper.instance();
	const cm = instance.codemirror.getCodeMirror()
	expect(cm.options.cursorBlinkRate).to.equal(530);
	editorWrapper.setProps({cursorBlinkRate: 0})
	expect(cm.options.cursorBlinkRate).to.equal(0);
  });
});

describe('complete', () => {
  it('handles code completion', (done) => {
    const sent = new Rx.Subject();
    const received = new Rx.Subject();
    const mockSocket = Rx.Subject.create(sent, received);
    const channels = {
      shell: mockSocket,
    };

    const cm = {
      getCursor: () => ({ line: 2 }),
      getValue: () => '\n\nimport thi',
      indexFromPos: () => 12,
      posFromIndex: (x) => ({ ch: x, line: 3 }),
    };

    const message = createMessage('complete_request');
    const observable = complete.codeCompleteObservable(channels, cm, message);

    // Craft the response to their message
    const response = createMessage('complete_reply');
    response.content = {
      matches: ['import this'],
      cursor_start: 9,
      cursor_end: 10, // Likely hokey values
    }
    response.parent_header = Object.assign({}, message.header);

    // Listen on the Observable
    observable.subscribe(
      msg => {
        expect(msg).to.deep.equal({
            from: { line: 3, ch: 9 },
            list: ["import this"],
            to: { ch: 10, line: 3 },
          });
      },
      err => { throw err },
      done
    );
    received.next(response);
  });
});

describe('completionRequest', () => {
  it('creates a valid v5 message for complete_request', () => {
    const message = complete.completionRequest('\n\nimport thi', 12);
    expect(message.content).to.deep.equal({
      code: '\n\nimport thi',
      cursor_pos: 12,
    });
    expect(message.header.msg_type).to.equal('complete_request');
  })
})

describe('formChangeObject', () => {
  it('translates arguments to a nice Object', () => {
    expect(complete.formChangeObject(1,2)).to.deep.equal({cm: 1, change: 2});
  })
})

describe('pick', () => {
  it('plucks the codemirror handle', () => {
    // no clue what to call this
    const handle = {
      pick: sinon.spy(),
    }

    complete.pick(null, handle);
    expect(handle.pick).to.have.been.called;
  })
})
