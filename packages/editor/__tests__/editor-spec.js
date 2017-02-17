import React from 'react';
import Rx from 'rxjs/Rx';

import { mount } from 'enzyme';

import { createMessage } from '@nteract/messaging';
import WrappedEditor from '../src/view';

const complete = require('../src/complete');

describe('WrappedEditor', () => {
  it.skip('reaches out for code completion', (done) => {
    const sent = new Rx.Subject();
    const received = new Rx.Subject();

    const mockSocket = Rx.Subject.create(sent, received);

    const channels = {
      shell: mockSocket,
    };

    const editorWrapper = mount(
      <WrappedEditor
        completion
        channels={channels}
      />,
    );

    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => 'MY VALUE',
      indexFromPos: () => 90001,
    };

    complete.codeComplete = jest.fn().mockImplementation((channels, editor) => channels.shell)

    sent.subscribe(msg => {
      expect(msg.content.code).toBe('MY VALUE');
      expect(complete.codeComplete).lastCalledWith(channels, cm);
      done();
    });
    editor.completions(cm, () => {});
  });
  it('doesn\'t try for code completion when not set', () => {
    const channels = {
      shell: 'turtle power',
    };

    const editorWrapper = mount(
      <WrappedEditor
        channels={channels}
      />,
    );
    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => 'MY VALUE',
      indexFromPos: () => 90001,
    };
    const callback = jest.fn();
    editor.completions(cm, callback);
    expect(callback).not.toHaveBeenCalled();
  });
  it('handles cursor blinkery changes', () => {
    const editorWrapper = mount(
      <WrappedEditor
        cursorBlinkRate={530}
      />,
    );
    const instance = editorWrapper.instance();
    const cm = instance.codemirror.getCodeMirror();
    expect(cm.options.cursorBlinkRate).toBe(530);
    editorWrapper.setProps({ cursorBlinkRate: 0 });
    expect(cm.options.cursorBlinkRate).toBe(0);
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
    };
    response.parent_header = Object.assign({}, message.header);

    // Listen on the Observable
    observable.subscribe(
      msg => {
        expect(msg).toEqual({
          from: { line: 3, ch: 9 },
          list: ['import this'],
          to: { ch: 10, line: 3 },
        });
      },
      err => { throw err; },
      done,
    );
    received.next(response);
  });
});
