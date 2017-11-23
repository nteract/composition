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
  it("pipes messages from socket appropriately", () => {
    const sent = new Subject();
    const received = new Subject();

    const shell = Subject.create(sent, received);
    const control = Subject.create(sent, received);
    const stdin = Subject.create(sent, received);
    const iopub = Subject.create(sent, received);

    const channel = createMainChannelFromChannels(shell, control, stdin, iopub);

    let messages = shell.first();
    channel.next({ type: "SHELL", body: { a: "b" } });
    expect(messages).toEqual({ a: "b" });

    messages = control.first();
    channel.next({ type: "CONTROL", body: { c: "d" } });
    expect(messages).toEqual({ c: "d" });

    messages = stdin.first();
    channel.next({ type: "STDIN", body: { e: "f" } });
    expect(messages).toEqual({ e: "f" });

    done();
  });
});
