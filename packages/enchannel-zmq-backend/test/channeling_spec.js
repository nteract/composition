/* eslint camelcase: 0 */ // <-- Per Jupyter message spec
import uuidv4 from "uuid/v4";

import { expect } from "chai";

import {
  createChannels,
  createChannelSubject,
  createIOPubSubject
} from "../src";

describe("createChannels", () => {
  it("creates the channels per enchannel spec", () => {
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

    expect(s).to.be.an("object");
    expect(s.shell).to.be.an("object");
    expect(s.stdin).to.be.an("object");
    expect(s.control).to.be.an("object");
    expect(s.iopub).to.be.an("object");

    s.shell.complete();
    s.stdin.complete();
    s.control.complete();
    s.iopub.complete();
  });
});

describe("createChannelSubject", () => {
  it("creates a subject for the channel", () => {
    const config = {
      signature_scheme: "hmac-sha256",
      key: "5ca1ab1e-c0da-aced-cafe-c0ffeefacade",
      ip: "127.0.0.1",
      transport: "tcp",
      iopub_port: 19009
    };
    const s = createChannelSubject("iopub", uuidv4(), config);
    expect(s.next).to.be.a("function");
    expect(s.complete).to.be.a("function");
    expect(s.subscribe).to.be.a("function");
    s.complete();
  });
});

describe("createIOPubSubject", () => {
  it("creates a subject with the default iopub subscription", () => {
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
