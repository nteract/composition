import * as jmp from 'jmp';
import * as uuid from 'uuid';

import { Observer, Observable, Subject } from 'rx';

function formConnectionString(config, channel) {
  const portDelimiter = config.transport === 'tcp' ? ':' : '-';
  const port = config[channel + '_port'];
  if (! port) {
    throw new Error(`Port not found for channel "${channel}"`);
  }
  return `${config.transport}://${config.ip}${portDelimiter}${port}`;
}

function sendMessage(socket, messageObject) {
  const message = new jmp.Message(messageObject);
  socket.send(message);
}

function createObserver(jmpSocket) {
  return Observer.create(messageObject => {
    sendMessage(jmpSocket, messageObject);
  }, err => {
    // We don't expect to send errors to the kernel
    console.error(err);
  }, () => {
    // tear it down, tear it *all* down
    jmpSocket.removeAllListeners();
    jmpSocket.close();
  });
}

function createObservable(jmpSocket) {
  return Observable.fromEvent(jmpSocket, 'message')
                   .publish()
                   .refCount();
}

function createSubject(jmpSocket) {
  const subj = Subject.create(createObserver(jmpSocket),
                              createObservable(jmpSocket));
  subj.send = subj.onNext; // Adapt naming to fit our parlance
  subj.close = subj.onCompleted;
  return subj;
}

function createSocket(type, channel, config) {
  const scheme = config.signature_scheme.slice('hmac-'.length);
  const socket = new jmp.Socket(type, scheme, config.key);
  socket.identity = channel + uuid.v4();
  socket.connect(formConnectionString(config, channel));
  return socket;
}

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
