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
    jmpSocket.close();
  });
}

function createObservable(jmpSocket) {
  return Observable.create(observer => {
    jmpSocket.on('message', message => {
      observer.onNext(message);
    });

    jmpSocket.on('error', err => {
      observer.onError(err);
    });

    return () => {
      jmpSocket.close();
    };
  })
  .publish()
  .refCount();
}

function createSubject(jmpSocket) {
  return Subject.create(createObserver(jmpSocket), createObservable(jmpSocket));
}

function enchannelZMQ(config) {
  const scheme = config.signature_scheme.slice('hmac-'.length);

  const shellSocket = new jmp.Socket('dealer', scheme, config.key);
  const controlSocket = new jmp.Socket('dealer', scheme, config.key);
  const ioSocket = new jmp.Socket('sub', scheme, config.key);

  shellSocket.identity = 'dealer' + uuid.v4();
  controlSocket.identity = 'control' + uuid.v4();
  ioSocket.identity = 'sub' + uuid.v4();

  shellSocket.connect(formConnectionString(config, 'shell'));
  controlSocket.connect(formConnectionString(config, 'control'));
  ioSocket.connect(formConnectionString(config, 'iopub'));

  ioSocket.subscribe('');

  return {
    shellSubject: createSubject(shellSocket),
    controlSubject: createSubject(controlSocket),
    ioSubject: createSubject(ioSocket),
  };
}

module.exports = enchannelZMQ;
