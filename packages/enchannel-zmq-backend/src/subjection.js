import { Observer, Observable, Subject } from 'rx';
import * as jmp from 'jmp';

import {
  ZMQType,
} from './constants';

/**
 * Recursive Object.freeze, does not handle functions since Jupyter messages
 * are plain JSON.
 * @param {Object} obj object to deeply freeze
 * @return {Object} the immutable object
 */
export function deepFreeze(obj) {
  // Freeze properties before freezing self
  Object.getOwnPropertyNames(obj).forEach(name => {
    const prop = obj[name];
    if(typeof prop === 'object' && prop !== null && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });
  // Freeze self
  return Object.freeze(obj);
}

/**
 * Takes a Jupyter spec connection info object and channel and returns the
 * string for a channel. Abstracts away tcp and ipc(?) connection string
 * formatting
 * @param {Object} config  Jupyter connection information
 * @param {string} channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @return {string} The connection string
 */
export function formConnectionString(config, channel) {
  const portDelimiter = config.transport === 'tcp' ? ':' : '-';
  const port = config[channel + '_port'];
  if (! port) {
    throw new Error(`Port not found for channel "${channel}"`);
  }
  return `${config.transport}://${config.ip}${portDelimiter}${port}`;
}

/**
 * A RxJS wrapper around jmp sockets, that takes care of sending messages and
 * cleans up after itself
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Observer} an observer that allows sending messages onNext and
 *                       closes the underlying socket onCompleted
 */
export function createObserver(socket) {
  return Observer.create(messageObject => {
    socket.send(new jmp.Message(messageObject));
  }, err => {
    // We don't expect to send errors to the kernel
    console.error(err);
  }, () => {
    // tear it down, tear it *all* down
    socket.removeAllListeners();
    socket.close();
  });
}

/**
 * Creates observable that behaves according to enchannel spec
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Observable} an Observable that publishes kernel channel messages
 */
export function createObservable(socket) {
  return Observable.fromEvent(socket, 'message')
                   .map(msg => {
                     // Conform to same message format as notebook websockets
                     // See https://github.com/n-riesco/jmp/issues/10
                     delete msg.idents;
                     delete msg.signatureOK;
                     delete msg.blobs;
                     // Deep freeze the message
                     deepFreeze(msg);
                     return msg;
                   })
                   .publish()
                   .refCount();
}

/**
 * Helper function for creating a subject from a socket
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Subject} subject for sending and receiving messages to kernels
 */
export function createSubject(socket) {
  const subj = Subject.create(createObserver(socket),
                              createObservable(socket));
  subj.send = subj.onNext;       // Adapt naming to fit our parlance
  subj.close = subj.onCompleted;
  return subj;
}

/**
 * Creates a socket for the given channel with ZMQ channel type given a config
 * @param {string} channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @param {string} identity UUID
 * @param {Object} config  Jupyter connection information
 * @return {jmp.Socket} The new Jupyter ZMQ socket
 */
export function createSocket(channel, identity, config) {
  const zmqType = ZMQType.frontend[channel];
  const scheme = config.signature_scheme.slice('hmac-'.length);
  const socket = new jmp.Socket(zmqType, scheme, config.key);
  socket.identity = identity;
  socket.connect(formConnectionString(config, channel));
  return socket;
}
