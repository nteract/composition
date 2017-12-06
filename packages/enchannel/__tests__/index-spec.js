const enchannel = require("../");

function spoofChannels() {
  const shell = {
    next: jest.fn(),
    complete: jest.fn(),
    pipe: () => shell,
    subscribe: cb => cb.call(shell)
  };
  return {
    shell,
    iopub: { complete: jest.fn() },
    stdin: { complete: jest.fn() },
    control: { complete: jest.fn() },
    heartbeat: { complete: jest.fn() }
  };
}

describe("shutdownRequest", () => {
  it("shutdowns channels", () => {
    const channels = spoofChannels();
    enchannel.shutdownRequest(channels);
    expect(channels.complete).toBeCalled();
  });
  it("handles missing heartbeat", () => {
    const channels = spoofChannels();
    channels.heartbeat = undefined;
    enchannel.shutdownRequest(channels);
    expect(channels.complete).toBeCalled();
  });
  it("sends shutdownRequest but doesn't close channels", () => {
    const channels = spoofChannels();
    enchannel.shutdownRequest(channels, true);
    expect(channels.shell.complete).not.toBeCalled();
    expect(channels.iopub.complete).not.toBeCalled();
    expect(channels.stdin.complete).not.toBeCalled();
    expect(channels.control.complete).not.toBeCalled();
    expect(channels.heartbeat.complete).not.toBeCalled();
  });
});
