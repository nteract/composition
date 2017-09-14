import * as constants from "../src/constants";

// Solely testing the exported interface
describe("constants", () => {
  it("exports the standard Jupyter channels", () => {
    expect(constants.IOPUB).toBe("iopub");
    expect(constants.STDIN).toBe("stdin");
    expect(constants.SHELL).toBe("shell");
    expect(constants.CONTROL).toBe("control");

    expect(constants.ZMQType.frontend[constants.IOPUB]).toBe(constants.SUB);

    expect(constants.ZMQType.frontend[constants.STDIN]).toBe(constants.DEALER);

    expect(constants.ZMQType.frontend[constants.SHELL]).toBe(constants.DEALER);

    expect(constants.ZMQType.frontend[constants.CONTROL]).toBe(
      constants.DEALER
    );
  });
});
