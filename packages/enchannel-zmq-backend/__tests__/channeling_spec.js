/* eslint camelcase: 0 */ // <-- Per Jupyter message spec
import uuidv4 from "uuid/v4";

import { createChannels, createIOPubSubject } from "../src";

describe("createChannels", () => {
  test("creates the channels per enchannel spec", () => {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      shell_port: 19009,
      stdin_port: 19010,
      control_port: 19011,
      iopub_port: 19012
    };
    const s = createChannels(uuidv4(), config);

    expect(typeof s).toBe("object");
    expect(typeof s.shell).toBe("object");
    expect(typeof s.stdin).toBe("object");
    expect(typeof s.control).toBe("object");
    expect(typeof s.iopub).toBe("object");

    s.shell.complete();
    s.stdin.complete();
    s.control.complete();
    s.iopub.complete();
  });
});

describe("createIOPubSubject", () => {
  test("creates a subject with the default iopub subscription", () => {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      iopub_port: 19011
    };
    const s = createIOPubSubject(uuidv4(), config);
    s.complete();
  });
});
