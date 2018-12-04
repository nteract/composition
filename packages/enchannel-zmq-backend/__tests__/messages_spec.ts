import { randomBytes } from "crypto";

import { encodeJupyterMessage, decodeJupyterMessage } from "../src/messages";

import { createExecuteRequest } from "@nteract/messaging";

describe("JupyterMessages", () => {
  test("can be validated", () => {
    const scheme = "sha256";
    const key = randomBytes(256).toString("base64");

    const originalMessage = createExecuteRequest("import this");
    const messageFrames = encodeJupyterMessage(originalMessage, scheme, key);

    const decodedMessage = decodeJupyterMessage(messageFrames, scheme, key);

    // @nteract/messaging includes `channels` whereas on the wire doesn't include it
    const originalMessageWithoutChannels = { ...originalMessage };
    delete originalMessageWithoutChannels["channel"];

    expect(decodedMessage).toEqual(originalMessageWithoutChannels);

    const wrongKey = randomBytes(256).toString("base64");
    console.warn = jest.fn();
    expect(decodeJupyterMessage(messageFrames, scheme, wrongKey)).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
