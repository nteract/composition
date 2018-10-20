const tooltip = require("../src/jupyter/tooltip");

describe("tooltipRequest", () => {
  it("creates a valid v5 message for inspect_request", () => {
    const message = tooltip.tooltipRequest("map", 3);
    expect(message.content).toEqual({
      code: "map",
      cursor_pos: 3,
      detail_level: 0
    });
    expect(message.header.msg_type).toEqual("inspect_request");
  });
});
