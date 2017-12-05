// @flow
import { SHELL, STDIN, IOPUB, CONTROL } from "./constants";
import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";
import { Observable } from "rxjs/Observable";

import { merge } from "rxjs/observable/merge";

import { map } from "rxjs/operators";

import { createSubject, createSocket } from "./subjection";

import type { JUPYTER_CONNECTION_INFO } from "./subjection";

import { v4 as uuid } from "uuid";

type HEADER_FILLER = {
  session: string,
  username: string
};

export function getUsername(): string {
  return (
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME ||
    "username" // This is the fallback that the classic notebook uses
  );
}

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
  config: JUPYTER_CONNECTION_INFO,
  subscription: string = "",
  identity: string = uuid(),
  header: HEADER_FILLER = {
    session: uuid(),
    username: getUsername()
  }
) {
  const channels = createChannels(identity, config, subscription);
  const main = createMainChannelFromChannels(channels, header);
  return main;
}

export function createMainChannelFromChannels(
  channels: {
    [string]: rxjs$Subject<*>
  },
  header: HEADER_FILLER = {
    session: uuid(),
    username: getUsername()
  }
) {
  const main = Subject.create(
    Subscriber.create({
      next: message => {
        const channel = channels[message.channel];
        if (channel) {
          channel.next({
            ...message,
            header: { ...message.header, ...header }
          });
        } else {
          // messages with no channel are dropped instead of bombing the stream
          console.warn("message sent without channel", message);
          return;
        }
      }
    }),
    merge(
      ...Object.keys(channels).map(name =>
        // Route the message according to channel name
        channels[name].pipe(map(body => ({ ...body, channel: name })))
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
