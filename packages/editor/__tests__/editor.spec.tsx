import { createMessage } from "@nteract/messaging";
import { mount } from "enzyme";
import React from "react";
import { empty, Subject } from "rxjs";

import Immutable from "immutable";
import Editor from "../src/";

const complete = require("../src/jupyter/complete");
const tooltip = require("../src/jupyter/tooltip");

jest.useFakeTimers();

describe("editor.hint CodeMirror callback", () => {
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

    editor.hint(cm, () => {});

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

    for (let i = 0; i < 3; i++) {
      editor.hint(cm, () => {});
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

    for (let i = 0; i < 3; i++) {
      editor.debounceNextCompletionRequest = false;
      editor.hint(cm, () => {});
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
    editor.hint(cm, () => {});
    editor.hint(cm, () => {});
    editor.hint(cm, () => {});

    editor.debounceNextCompletionRequest = false;
    editor.hint(cm, () => {});
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
    editor.hint(cm, callback);
    expect(callback).not.toHaveBeenCalled();
  });
});

describe("Editor", () => {
  it("handles cursor blinkery changes", () => {
    const editorWrapper = mount(
      <Editor codeMirror={{ cursorBlinkRate: 531 }} />
    );
    const instance = editorWrapper.instance();
    const cm = instance.cm;
    expect(cm.options.cursorBlinkRate).toBe(531);
    editorWrapper.setProps({ codeMirror: { cursorBlinkRate: 0 } });
    expect(cm.options.cursorBlinkRate).toBe(0);
  });
  it("tab triggers completion when pressed at end of line", () => {
    const component = mount(<Editor />);
    const editor = {
      somethingSelected: jest.fn(() => false),
      execCommand: jest.fn(),
      getCursor: () => ({ line: 1, ch: 1 })
    };
    component.instance().executeTab(editor);
    expect(editor.execCommand).toBeCalledWith("autocomplete");
  });
  it("tab indents when something is selected", () => {
    const component = mount(<Editor />);
    const editor = {
      somethingSelected: jest.fn(() => true),
      execCommand: jest.fn(),
      getCursor: () => ({ line: 0, ch: 1 })
    };
    component.instance().executeTab(editor);
    expect(editor.execCommand).toBeCalledWith("indentMore");
  });
  it("converts an Immutable.Map mode to an object", () => {
    const component = mount(
      <Editor codeMirror={{ mode: Immutable.Map({ language: "python" }) }} />
    );
    const result = component.instance().cleanMode();
    expect(result.language).toBe("python");
  });
  it("can update component", () => {
    const component = mount(
      <Editor codeMirror={{ mode: Immutable.Map({ language: "python" }) }} />
    );
    component.setProps({ codeMirror: { mode: "text/ipython" } });
    expect(component.isEmptyRender()).toBe(false);
  });
  it("can handle moving line down if not at bottom", () => {
    const component = mount(
      <Editor codeMirror={{ mode: Immutable.Map({ language: "python" }) }} />
    );
    const editor = {
      getCursor: jest.fn(() => ({ line: 2, ch: 1 })),
      lastLine: jest.fn(() => 5),
      getLine: jest.fn(() => "test line"),
      execCommand: jest.fn(() => null)
    };
    component.instance().goLineDownOrEmit(editor);
    expect(editor.execCommand).toBeCalledWith("goLineDown");
  });

  it("can handle moving line down if at bottom", () => {
    const component = mount(
      <Editor codeMirror={{ mode: Immutable.Map({ language: "python" }) }} />
    );
    const editor = {
      getCursor: jest.fn(() => ({ line: 5, ch: 4 })),
      lastLine: jest.fn(() => 5),
      getLine: jest.fn(() => "test"),
      somethingSelected: jest.fn(() => false),
      execCommand: jest.fn(() => null)
    };
    component.instance().goLineDownOrEmit(editor);
    expect(editor.execCommand).not.toBeCalled();
  });
  it("can handle moving line up if not at top", () => {
    const component = mount(
      <Editor codeMirror={{ mode: Immutable.Map({ language: "python" }) }} />
    );
    const editor = {
      getCursor: jest.fn(() => ({ line: 2, ch: 1 })),
      somethingSelected: jest.fn(() => false),
      execCommand: jest.fn(() => null)
    };
    component.instance().goLineUpOrEmit(editor);
    expect(editor.execCommand).toBeCalledWith("goLineUp");
  });

  it("can handle moving line up if at top", () => {
    const component = mount(
      <Editor codeMirror={{ mode: Immutable.Map({ language: "python" }) }} />
    );
    const editor = {
      getCursor: jest.fn(() => ({ line: 0, ch: 0 })),
      somethingSelected: jest.fn(() => false),
      execCommand: jest.fn(() => null)
    };
    component.instance().goLineUpOrEmit(editor);
    expect(editor.execCommand).not.toBeCalled();
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
