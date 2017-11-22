import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject
} from "..";

import uuidv4 from "uuid/v4";
import { Subject } from "rxjs/Subject";

import { createMainChannelFromChannels, createMainChannel } from "../src";

// Solely testing the exported interface on the built ES5 JavaScript
describe("the built version of enchannel-zmq-backend", () => {
  it("exports create helpers for control, stdin, iopub, and shell", () => {
    expect(createControlSubject).toBeDefined();
    expect(createStdinSubject).toBeDefined();
    expect(createIOPubSubject).toBeDefined();
    expect(createShellSubject).toBeDefined();
  });
});

describe("createMainChannel", () => {
  it("creates a multiplexed channel", () => {
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
    const c = createMainChannel(uuidv4(), config);
    expect(c).toBeDefined();
  });

  it("pipes messages from socket appropriately", async () => {
    const sent = new Subject();
    const received = new Subject();

    const shell = Subject.create(sent, received);
    const control = Subject.create(sent, received);
    const stdin = Subject.create(sent, received);
    const iopub = Subject.create(sent, received);

    const channel = createMainChannelFromChannels(shell, control, stdin, iopub);

    let messages = await shell.pipe(first()).toPromise();
    channel.send({ type: "SHELL", body: { a: "b" } });
    expect(messages).toEqual({ a: "b" });

    messages = await control.pipe(first()).toPromise();
    channel.send({ type: "CONTROL", body: { c: "d" } });
    expect(messages).toEqual({ c: "d" });

    messages = await stdin.pipe(first()).toPromise();
    channel.send({ type: "STDIN", body: { e: "f" } });
    expect(messages).toEqual({ e: "f" });
  });
});
