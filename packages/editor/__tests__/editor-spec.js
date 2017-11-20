import React from "react";
import { Subject } from "rxjs/Subject";

import { mount } from "enzyme";

import { createMessage } from "@nteract/messaging";
import Editor from "../src/";

const complete = require("../src/jupyter/complete");
const tooltip = require("../src/jupyter/tooltip");

describe("Editor", () => {
  it.skip("reaches out for code completion", done => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    const channels = { shell: mockSocket };

    const editorWrapper = mount(<Editor completion channels={channels} />);

    expect(editorWrapper).not.toBeNull();

    const editor = editorWrapper.instance();
    const cm = {
      getCursor: () => ({ line: 12 }),
      getValue: () => "MY VALUE",
      indexFromPos: () => 90001
    };

    complete.codeComplete = jest.fn().mockImplementation(chan => chan.shell);

    sent.subscribe(msg => {
      expect(msg.content.code).toBe("MY VALUE");
      expect(complete.codeComplete).lastCalledWith(channels, cm);
      done();
    });
    editor.completions(cm, () => {});
  });
  it("doesn't try for code completion when not set", () => {
    const channels = { shell: "turtle power" };

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
  it("handles cursor blinkery changes", () => {
    const editorWrapper = mount(<Editor cursorBlinkRate={530} />);
    const instance = editorWrapper.instance();
    const cm = instance.codemirror.getCodeMirror();
    expect(cm.options.cursorBlinkRate).toBe(530);
    editorWrapper.setProps({ cursorBlinkRate: 0 });
    expect(cm.options.cursorBlinkRate).toBe(0);
  });
});

describe("complete", () => {
  it("handles code completion", done => {
    const sent = new Subject();
    const received = new Subject();
    const mockSocket = Subject.create(sent, received);
    const channels = { shell: mockSocket };

    const cm = {
      getCursor: () => ({ line: 2 }),
      getValue: () => "\n\nimport thi",
      indexFromPos: () => 12,
      posFromIndex: x => ({ ch: x, line: 3 })
    };

    const message = createMessage("complete_request");
    const observable = complete.codeCompleteObservable(channels, cm, message);

    // Craft the response to their message
    const response = createMessage("complete_reply");
    response.content = {
      matches: ["import this"],
      cursor_start: 9,
      cursor_end: 10
    }; // Likely hokey values
    response.parent_header = Object.assign({}, message.header);

    // Listen on the Observable
    observable.subscribe(
      msg => {
        expect(msg.from).toEqual({ line: 3, ch: 9 });
        expect(msg.list[0].text).toEqual("import this");
        expect(msg.to).toEqual({ ch: 10, line: 3 });
      },
      err => {
        throw err;
      },
      done
    );
    received.next(response);
  });
});

describe("tooltip", () => {
  it("handles tooltip", done => {
    const sent = new Subject();
    const received = new Subject();
    const mockSocket = Subject.create(sent, received);
    const channels = { shell: mockSocket };

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
