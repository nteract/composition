import * as jmp from 'jmp';
import * as uuid from 'uuid';

import { Observer, Observable, Subject } from 'rx';
/**
 * Takes a Jupyter spec connection info object and channel and returns the
 * string for a channel. Abstracts away tcp and ipc(?) connection string
 * formatting
 * @param {Object} config  Jupyter connection information
 * @param {string} channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @return {string} The connection string
 */
function formConnectionString(config, channel) {
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
function createObserver(socket) {
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
 * Recursive Object.freeze, does not handle functions since Jupyter messages
 * are plain JSON.
 * @param {Object} obj object to deeply freeze
 * @return {Object} the immutable object
 */
function deepFreeze(obj) {
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
 * Creates observable that behaves according to enchannel spec
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Observable} an Observable that publishes kernel channel messages
 */
function createObservable(socket) {
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
 * Helper function for enchannelZMQ
 * @param {jmp.Socket} socket the jmp/zmq socket connection to a kernel channel
 * @return {Rx.Subject} subject for sending and receiving messages to kernels
 */
function createSubject(socket) {
  const subj = Subject.create(createObserver(socket),
                              createObservable(socket));
  subj.send = subj.onNext; // Adapt naming to fit our parlance
  subj.close = subj.onCompleted;
  return subj;
}

/**
 * @param {string} type ZMQ channel type ("dealer", "router", "sub", etc)
 * @param {string} channel Jupyter channel ("iopub", "shell", "control", "stdin")
 * @param {Object} config  Jupyter connection information
 * @return {jmp.Socket} The new Jupyter ZMQ socket
 */
function createSocket(type, channel, config) {
  const scheme = config.signature_scheme.slice('hmac-'.length);
  const socket = new jmp.Socket(type, scheme, config.key);
  socket.identity = channel + uuid.v4();
  socket.connect(formConnectionString(config, channel));
  return socket;
}

/**
 * Takes in Jupyter connection information and return an object with subjects
 * for each of the Jupyter channels.
 * @param {Object} config  Jupyter connection information
 * @return {Object}
 */
function enchannelZMQ(config) {
  const shellSocket = createSocket('dealer', 'shell', config);
  const controlSocket = createSocket('dealer', 'control', config);
  const stdinSocket = createSocket('dealer', 'stdin', config);
  const iopubSocket = createSocket('sub', 'iopub', config);

  iopubSocket.subscribe('');

  return {
    shell: createSubject(shellSocket),
    control: createSubject(controlSocket),
    iopub: createSubject(iopubSocket),
    stdin: createSubject(stdinSocket),
  };
}

module.exports = enchannelZMQ;
