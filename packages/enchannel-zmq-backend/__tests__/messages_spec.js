import { randomBytes } from "crypto";

import {
  encodeJupyterMessage,
  decodeJupyterMessage,
  Message
} from "../src/messages";

describe("JupyterMessages", () => {
  test("can be validated", () => {
    const scheme = "sha256";
    const key = randomBytes(256).toString("base64");

    const originalMessage = new Message();
    const messageFrames = encodeJupyterMessage(originalMessage, scheme, key);

    const decodedMessage = decodeJupyterMessage(messageFrames, scheme, key);
    expect(decodedMessage).toEqual(originalMessage);

    const wrongKey = randomBytes(256).toString("base64");
    console.warn = jest.fn();
    expect(decodeJupyterMessage(messageFrames, scheme, wrongKey)).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });
});
