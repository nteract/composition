// @flow
import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";
import { Observable } from "rxjs/Observable";
import { merge } from "rxjs/observable/merge";
import { map, publish, refCount } from "rxjs/operators";

import { Dealer, Subscriber as ZMQSubscriber } from "zeromq-ng";
import uuid from "uuid/v4";

import {
  decodeJupyterMessage,
  encodeJupyterMessage,
  Message
} from "./messages";

export type CHANNEL_NAME = "iopub" | "stdin" | "shell" | "control";
export type JMPSocket = ZMQSubscriber | Dealer;

export type JUPYTER_CONNECTION_INFO = {
  iopub_port: number,
  shell_port: number,
  stdin_port: number,
  control_port: number,
  signature_scheme: "hmac-sha256" | string, // Allows practically any string, they're really constrained though
  hb_port: number,
  ip: string,
  key: string,
  transport: "tcp" | "ipc" | string // Only known transports at the moment, we'll allow string in general though
};

export function fromSocket(socket: JMPSocket) {
  // $FlowFixMe
  return Observable.create(async observer => {
    while (!socket.closed) {
      const msg = await socket.receive();
      observer.next(msg);
    }
    observer.complete();
  });
}

/**
 * Takes a Jupyter spec connection info object and channel and returns the
 * string for a channel. Abstracts away tcp and ipc(?) connection string
 * formatting
 * @param {Object} config  Jupyter connection information
 * @param {string} channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @return {string} The connection string
 */
export function formConnectionString(
  config: JUPYTER_CONNECTION_INFO,
  channel: CHANNEL_NAME
) {
  const portDelimiter = config.transport === "tcp" ? ":" : "-";
  const port = config[channel + "_port"];
  if (!port) {
    throw new Error(`Port not found for channel "${channel}"`);
  }
  return `${config.transport}://${config.ip}${portDelimiter}${port}`;
}

/**
 * Creates a socket for the given channel with ZMQ channel type given a config
 * @param {string} channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @param {string} identity UUID
 * @param {Object} config  Jupyter connection information
 * @return {jmp.Socket} The new Jupyter ZMQ socket
 */
export function createSocket(
  channel: CHANNEL_NAME,
  identity: string,
  config: JUPYTER_CONNECTION_INFO
): Dealer | ZMQSubscriber {
  const socket =
    channel === "iopub"
      ? new ZMQSubscriber()
      : new Dealer({ routingId: identity });

  const url = formConnectionString(config, channel);
  socket.connect(url);
  return socket;
}

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
): Channels {
  const sockets = createSockets(config, subscription, identity);
  return createMainChannelFromSockets(config, sockets, header);
}

/**
 * createSockets sets up the sockets for each of the jupyter channels
 * @return {[type]}              [description]
 */
export function createSockets(
  config: JUPYTER_CONNECTION_INFO,
  subscription: string = "",
  identity: string = uuid()
) {
  const shell = createSocket("shell", identity, config);
  const control = createSocket("control", identity, config);
  const stdin = createSocket("stdin", identity, config);
  const iopub = createSocket("iopub", identity, config);

  // NOTE: ZMQ PUB/SUB subscription (not an Rx subscription)
  iopub.subscribe(subscription);

  return { shell, control, stdin, iopub };
}

export function createMainChannelFromSockets(
  config: JUPYTER_CONNECTION_INFO,
  sockets: { [string]: JMPSocket },
  header: HEADER_FILLER = {
    session: uuid(),
    username: getUsername()
  }
) {
  const scheme = config.signature_scheme.slice("hmac-".length);
  // The mega subject that encapsulates all the sockets as one multiplexed stream
  return Subject.create(
    // $FlowFixMe: figure out if this is a shortcoming in the flow def or our declaration
    Subscriber.create(
      // $FlowFixMe
      async message => {
        // There's always a chance that a bad message is sent, we'll ignore it
        // instead of consuming it
        if (!message || !message.channel) {
          console.warn("message sent without a channel", message);
          // $FlowFixMe
          return;
        }
        const socket = sockets[message.channel];
        if (!socket) {
          // If, for some reason, a message is sent on a channel we don't have
          // a socket for, warn about it but don't bomb the stream
          console.warn("channel not understood for message", message);
          // $FlowFixMe
          return;
        }
        const jMessage = new Message({
          // Fold in the setup header to ease usage of messages on channels
          header: { ...message.header, ...header },
          parent_header: message.parent_header,
          content: message.content,
          metadata: message.metadata,
          buffers: message.buffers
        });
        await socket.send(encodeJupyterMessage(jMessage, scheme, config.key));
      },
      undefined, // not bothering with sending errors on
      () => {
        // When the subject is completed / disposed shutdown the socket
        console.warn("CLOSING SOCKETS");
        Object.keys(sockets).forEach(name => sockets[name].close());
      }
    ),
    // Messages from kernel on the sockets
    merge(
      // Form an Observable with each socket
      ...Object.keys(sockets).map(name =>
        fromSocket(sockets[name]).pipe(
          map(rawMessage => {
            const body = decodeJupyterMessage(rawMessage, scheme, config.key);
            // Route the message for the frontend by setting the channel
            const msg = { ...body, channel: name };
            // Conform to same message format as notebook websockets
            // See https://github.com/n-riesco/jmp/issues/10
            delete msg.idents;
            return msg;
          }),
          publish(),
          refCount()
        )
      )
    ).pipe(
      publish(),
      refCount()
    )
  );
}
