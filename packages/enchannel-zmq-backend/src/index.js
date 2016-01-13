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
  return subj;
}

function enchannelZMQ(config) {
  const scheme = config.signature_scheme.slice('hmac-'.length);

  const shellSocket = new jmp.Socket('dealer', scheme, config.key);
  const controlSocket = new jmp.Socket('dealer', scheme, config.key);
  const ioSocket = new jmp.Socket('sub', scheme, config.key);

  shellSocket.identity = 'shell' + uuid.v4();
  controlSocket.identity = 'control' + uuid.v4();
  ioSocket.identity = 'iopub' + uuid.v4();

  shellSocket.connect(formConnectionString(config, 'shell'));
  controlSocket.connect(formConnectionString(config, 'control'));
  ioSocket.connect(formConnectionString(config, 'iopub'));

  ioSocket.subscribe('');

  return {
    shell: createSubject(shellSocket),
    control: createSubject(controlSocket),
    io: createSubject(ioSocket),
  };
}

module.exports = enchannelZMQ;
