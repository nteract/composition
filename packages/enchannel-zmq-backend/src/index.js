// @flow
import { SHELL, STDIN, IOPUB, CONTROL } from "./constants";
import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";
import { Observable } from "rxjs/Observable";

import { merge } from "rxjs/observable/merge";

import { map } from "rxjs/operators";

import { createSubject, createSocket } from "./subjection";

import type { JUPYTER_CONNECTION_INFO } from "./subjection";

/**
 * createMainChannel creates a multiplexed set of channels
 * @param  {string} identity                UUID
 * @param  {Object} config                  Jupyter connection information
 * @param  {string} config.ip               IP address of the kernel
 * @param  {string} config.transport        Transport, e.g. TCP
 * @param  {string} config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  {number} config.iopub_port       Port for iopub channel
 * @param  {string} subscription            subscribed topic; defaults to all
 * @return {Subject} Subject containing multiplexed channels
 */
export function createMainChannel(
  identity: string,
  config: JUPYTER_CONNECTION_INFO,
  subscription: string = ""
) {
  const { shell, control, stdin, iopub } = createChannels(
    identity,
    config,
    subscription
  );
  const main = createMainChannelFromChannels(shell, control, stdin, iopub);
  return main;
}

export function createMainChannelFromChannels(
  shell: *,
  control: *,
  stdin: *,
  iopub: *
) {
  const main = Subject.create(
    Subscriber.create({
      next: message => {
        switch (message.channel) {
          case SHELL:
            shell.next(message);
            break;
          case CONTROL:
            control.next(message);
            break;
          case STDIN:
            stdin.next(message);
            break;
          case IOPUB:
            iopub.next(message);
            break;
          default:
            // messages with no channel are dropped instead of bombing the stream
            console.warn("message sent without channel", message);
            return;
        }
      }
    }),
    merge(
      shell.pipe(
        map(body => {
          return { ...body, channel: SHELL };
        })
      ),
      stdin.pipe(
        map(body => {
          return { ...body, channel: STDIN };
        })
      ),
      control.pipe(
        map(body => {
          return { ...body, channel: CONTROL };
        })
      ),
      iopub.pipe(
        map(body => {
          return { ...body, channel: IOPUB };
        })
      )
    )
  );
  return main;
}

/**
 * createChannels creates an enchannel spec channels object
 * @param  {string} identity                UUID
 * @param  {Object} config                  Jupyter connection information
 * @param  {string} config.ip               IP address of the kernel
 * @param  {string} config.transport        Transport, e.g. TCP
 * @param  {string} config.signature_scheme Hashing scheme, e.g. hmac-sha256
 * @param  {number} config.iopub_port       Port for iopub channel
 * @param  {string} subscription            subscribed topic; defaults to all
 * @return {object} channels object, per enchannel spec
 */
export function createChannels(
  identity: string,
  config: JUPYTER_CONNECTION_INFO,
  subscription: string = ""
) {
  return {
    shell: createShellSubject(identity, config),
    control: createControlSubject(identity, config),
    stdin: createStdinSubject(identity, config),
    iopub: createIOPubSubject(identity, config, subscription)
  };
}

export function createShellSubject(
  identity: string,
  config: JUPYTER_CONNECTION_INFO
) {
  return createSubject(createSocket("shell", identity, config));
}

export function createControlSubject(
  identity: string,
  config: JUPYTER_CONNECTION_INFO
) {
  return createSubject(createSocket("control", identity, config));
}

export function createStdinSubject(
  identity: string,
  config: JUPYTER_CONNECTION_INFO
) {
  return createSubject(createSocket("stdin", identity, config));
}

export function createIOPubSubject(
  identity: string,
  config: JUPYTER_CONNECTION_INFO,
  subscription: string = ""
) {
  const ioPubSocket = createSocket("iopub", identity, config);
  // NOTE: ZMQ PUB/SUB subscription (not an Rx subscription)
  ioPubSocket.subscribe(subscription);
  return createSubject(ioPubSocket);
}
