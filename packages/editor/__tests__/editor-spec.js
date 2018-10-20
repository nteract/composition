import React from "react";
import { Subject } from "rxjs/Subject";

import { empty } from "rxjs/observable/empty";

import { mount } from "enzyme";

import { createMessage } from "@nteract/messaging";
import Editor from "../src/";

const complete = require("../src/jupyter/complete");
const tooltip = require("../src/jupyter/tooltip");

jest.useFakeTimers();

describe("editor.completions CodeMirror callback", () => {
  it("eventually calls complete.codeComplete", () => {
    const channels = {};

    const editorWrapper = mount(<Editor completion channels={channels} />);

    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => "MY VALUE",
      indexFromPos: () => 90001
    };

    complete.codeComplete = jest.fn().mockImplementation(() => empty());

    editor.completions(cm, () => {});

    jest.runAllTimers();

    expect(complete.codeComplete).toBeCalledWith(channels, cm);
  });
  it("collapses multiple calls into one via debouncing", () => {
    const channels = {};

    const editorWrapper = mount(<Editor completion channels={channels} />);

    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => "MY VALUE",
      indexFromPos: () => 90001
    };

    complete.codeComplete = jest.fn().mockImplementation(() => empty());

    for (var i = 0; i < 3; i++ ) {
      editor.completions(cm, () => {});
    }

    jest.runAllTimers();

    expect(complete.codeComplete.mock.calls.length).toBe(1);
    expect(complete.codeComplete).toBeCalledWith(channels, cm);
  });
  it("can opt out of debouncing my mutating debounceNextCompletionRequest", () => {
    const channels = {};

    const editorWrapper = mount(<Editor completion channels={channels} />);

    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => "MY VALUE",
      indexFromPos: () => 90001
    };

    complete.codeComplete = jest.fn().mockImplementation(() => empty());

    for (var i = 0; i < 3; i++ ) {
      editor.debounceNextCompletionRequest = false;
      editor.completions(cm, () => {});
      expect(editor.debounceNextCompletionRequest).toBe(true);
    }

    jest.runAllTimers();

    expect(complete.codeComplete.mock.calls.length).toBe(3);
    expect(complete.codeComplete).toBeCalledWith(channels, cm);
  });
  it("debounceNextCompletionRequest discards queued debounced events", () => {
    const channels = {};

    const editorWrapper = mount(<Editor completion channels={channels} />);

    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => "MY VALUE",
      indexFromPos: () => 90001
    };

    complete.codeComplete = jest.fn().mockImplementation(() => empty());

    // By themselves, these would be debounced. If we aren't careful they will emerge after our
    // non-debounced call, creating duplicate requests.
    editor.completions(cm, () => {});
    editor.completions(cm, () => {});
    editor.completions(cm, () => {});

    editor.debounceNextCompletionRequest = false;
    editor.completions(cm, () => {});
    expect(editor.debounceNextCompletionRequest).toBe(true);

    jest.runAllTimers();

    expect(complete.codeComplete.mock.calls.length).toBe(1);
    expect(complete.codeComplete).toBeCalledWith(channels, cm);
  });
  it("doesn't call complete.codeComplete when completion property is unset", () => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    const channels = mockSocket;

    const editorWrapper = mount(<Editor channels={channels} />);
    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => "MY VALUE",
      indexFromPos: () => 90001
    };
    const callback = jest.fn();
    editor.completions(cm, callback);
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("Editor", () => {
  it("handles cursor blinkery changes", () => {
    const editorWrapper = mount(<Editor options={{ cursorBlinkRate: 530 }} />);
    const instance = editorWrapper.instance();
    const cm = instance.cm;
    expect(cm.options.cursorBlinkRate).toBe(530);
    editorWrapper.setProps({ options: { cursorBlinkRate: 0 } });
    expect(cm.options.cursorBlinkRate).toBe(0);
  });
});

describe("tooltip", () => {
  it("handles tooltip", done => {
    const sent = new Subject();
    const received = new Subject();
    const mockSocket = Subject.create(sent, received);
    const channels = mockSocket;

    const cm = {
      getCursor: () => ({ line: 0 }),
      getValue: () => "map",
      indexFromPos: () => 3,
      posFromIndex: x => ({ ch: x, line: 0 })
    };

    const message = createMessage("inspect_request");
    const observable = tooltip.tooltipObservable(channels, cm, message);

    // Craft the response to their message
    const response = createMessage("inspect_reply");
    response.content = {
      data: [
        "[0;31mInit signature:[0m [0mmap[0m[0;34m([0m[0mself[0m[0;34m,[0m [0;34m/[0m[0;34m,[0m [0;34m*[0m[0margs[0m[0;34m,[0m [0;34m**[0m[0mkwargs[0m[0;34m)[0m[0;34m[0m[0m↵[0;31mDocstring:[0m     ↵map(func, *iterables) --> map object↵↵Make an iterator that computes the function using arguments from↵each of the iterables.  Stops when the shortest iterable is exhausted.↵[0;31mType:[0m           type↵"
      ],
      cursor_pos: 3,
      detail_level: 0
    }; // Likely hokey values
    response.parent_header = Object.assign({}, message.header);

    // Listen on the Observable
    observable.subscribe(
      msg => {
        expect(msg).toEqual({
          dict: [
            "[0;31mInit signature:[0m [0mmap[0m[0;34m([0m[0mself[0m[0;34m,[0m [0;34m/[0m[0;34m,[0m [0;34m*[0m[0margs[0m[0;34m,[0m [0;34m**[0m[0mkwargs[0m[0;34m)[0m[0;34m[0m[0m↵[0;31mDocstring:[0m     ↵map(func, *iterables) --> map object↵↵Make an iterator that computes the function using arguments from↵each of the iterables.  Stops when the shortest iterable is exhausted.↵[0;31mType:[0m           type↵"
          ]
        });
      },
      err => {
        throw err;
      },
      done
    );
    received.next(response);
  });
});
