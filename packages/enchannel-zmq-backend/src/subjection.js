// @flow
import { Subscriber } from "rxjs/Subscriber";
import { Subject } from "rxjs/Subject";

import { fromEvent } from "rxjs/observable/fromEvent";
import { map, publish, refCount } from "rxjs/operators";

import * as jmp from "jmp";

import { ZMQType } from "./constants";

export type CHANNEL_NAME = "iopub" | "stdin" | "shell" | "control";

export type JUPYTER_CONNECTION_INFO = {
  iopub_port: number,
  shell_port: number,
  stdin_port: number,
  control_port: number,
  signature_scheme: "hmac-sha256" | string, // Allows practically any string, they're really constrained though
  hb_port: number,
  ip: string,
  key: string,
  transport: "tcp" | string // Only known transport at the moment, we'll allow string in general though
};

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
 * A RxJS wrapper around jmp sockets, that takes care of sending messages and
 * cleans up after itself
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Subscriber} a subscriber that allows sending messages on next()
 *                         and closes the underlying socket on complete()
 */
export function createSubscriber(socket: jmp.Socket) {
  return Subscriber.create({
    next: messageObject => {
      socket.send(new jmp.Message(messageObject));
    },
    complete: () => {
      // tear it down, tear it *all* down
      socket.removeAllListeners();
      socket.close();
    }
  });
}

/**
 * Creates observable that behaves according to enchannel spec
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Observable} an Observable that publishes kernel channel messages
 */
export function createObservable(socket: jmp.Socket) {
  return fromEvent(socket, "message").pipe(
    map(msg => {
      // Conform to same message format as notebook websockets
      // See https://github.com/n-riesco/jmp/issues/10
      delete msg.idents;
      return msg;
    }),
    publish(),
    refCount()
  );
}

/**
 * Helper function for creating a subject from a socket
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Subject} subject for sending and receiving messages to kernels
 */
export function createSubject(socket: jmp.Socket) {
  return Subject.create(createSubscriber(socket), createObservable(socket));
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
) {
  const zmqType = ZMQType.frontend[channel];
  const scheme = config.signature_scheme.slice("hmac-".length);
  const socket = new jmp.Socket(zmqType, scheme, config.key);
  socket.identity = identity;
  socket.connect(formConnectionString(config, channel));
  return socket;
}
