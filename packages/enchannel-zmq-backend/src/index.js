import * as jmp from 'jmp';
import * as uuid from 'uuid';

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

export default class EnchannelZMQ {
  constructor(config) {
    const scheme = config.signature_scheme.slice('hmac-'.length);

    this.shellSocket = new jmp.Socket('dealer', scheme, config.key);
    this.controlSocket = new jmp.Socket('dealer', scheme, config.key);
    this.ioSocket = new jmp.Socket('sub', config.signature_scheme, config.key);

    this.shellSocket.identity = 'dealer' + uuid.v4();
    this.controlSocket.identity = 'control' + uuid.v4();
    this.ioSocket.identity = 'sub' + uuid.v4();

    this.shellSocket.connect(formConnectionString(config, 'shell'));
    this.controlSocket.connect(formConnectionString(config, 'control'));
    this.ioSocket.connect(formConnectionString(config, 'iopub'));

    this.ioSocket.subscribe('');
  }

  dispose() {
    this.shellSocket.close();
    this.ioSocket.close();
    this.controlSocket.close();
  }
}
