import { Subject } from "rxjs/Subject";

import { createMessage } from "@nteract/messaging";

const complete = require("../src/jupyter/complete");

describe("completionRequest", () => {
  it("creates a valid v5 message for complete_request", () => {
    const message = complete.completionRequest("\n\nimport thi", 12);
    expect(message.content).toEqual({ code: "\n\nimport thi", cursor_pos: 12 });
    expect(message.header.msg_type).toEqual("complete_request");
  });
});

describe("formChangeObject", () => {
  it("translates arguments to a nice Object", () => {
    expect(complete.formChangeObject(1, 2)).toEqual({ cm: 1, change: 2 });
  });
});

describe("pick", () => {
  it("plucks the codemirror handle", () => {
    const handle = { pick: jest.fn() };

    complete.pick(null, handle);
    expect(handle.pick).toBeCalled();
  });
});

describe("codeCompleteObservable", () => {
  it("handles code completion", done => {
    const sent = new Subject();
    const received = new Subject();
    const mockSocket = Subject.create(sent, received);
    const channels = mockSocket;

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
