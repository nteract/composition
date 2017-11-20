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
