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
  test("exports create helpers for control, stdin, iopub, and shell", () => {
    expect(createControlSubject).toBeDefined();
    expect(createStdinSubject).toBeDefined();
    expect(createIOPubSubject).toBeDefined();
    expect(createShellSubject).toBeDefined();
  });
});

describe("createMainChannel", () => {
  test("pipes messages from socket appropriately", () => {
    const sent = new Subject();
    const received = new Subject();

    const shell = Subject.create(sent, received);
    const control = Subject.create(sent, received);
    const stdin = Subject.create(sent, received);
    const iopub = Subject.create(sent, received);

    const channel = createMainChannelFromChannels(shell, control, stdin, iopub);

    shell.subscribe(value => {
      expect(value).toEqual({ a: "b" });
    });
    channel.next({ type: "SHELL", body: { a: "b" } });

    control.subscribe(value => {
      expect(value).toEqual({ c: "d" });
    });
    channel.next({ type: "CONTROL", body: { c: "d" } });

    stdin.subscribe(value => {
      expect(value).toEqual({ e: "f" });
    });
    channel.next({ type: "STDIN", body: { e: "f" } });
  });
});
