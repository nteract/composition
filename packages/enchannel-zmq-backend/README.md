# enchannel-zmq-backend

The ZeroMQ backend for [`enchannel`](https://github.com/nteract/enchannel).

## Installation

`npm install enchanell-zmq-backend`

## About

Given a currently running Jupyter runtime, creates [RxJS](https://github.com/Reactive-Extensions/RxJS) subjects (`Observable`s and `Observer`s) for four of the Jupyter channels:

* shell
* control
* iopub
* stdin

## Usage

`enchannel-zmq-backend` exports four functions to create channels

```javascript
import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend'
```

Each of those functions accepts an identity and a kernel runtime object
(this matches the on-disk JSON):

```javascript
const runtimeConfig = {
  stdin_port: 58786,
  ip: '127.0.0.1',
  control_port: 58787,
  hb_port: 58788,
  signature_scheme: 'hmac-sha256',
  key: 'dddddddd-eeee-aaaa-dddd-dddddddddddd',
  shell_port: 58784,
  transport: 'tcp',
  iopub_port: 58785
}
```

You'll want to set up your identity, relying on the node `uuid` package:

```javascript
const uuid = require('uuid');
const identity = uuid.v4();
```

Creating a subject

```javascript
const shell = createShellSubject(identity, runtimeConfig)
```

### Subscribing to messages

Subscribing to iopub:

```javascript
const iopub = createIOPubSubject(identity, runtimeConfig);
var obs = iopub.subscribe(msg => {
  console.log(msg);
}

// later, run obs.dispose() to unsubscribe
```

Since these are RxJS Observables, you can also `filter`, `map`, `scan` and many other operators:

```javascript
iopub.filter(msg => msg.header.msg_type === 'execute_result')
     .map(msg => msg.content.data)
     .subscribe(x => { console.log(`DATA! ${util.inspect(x)}`)})
```

### Sending messages to the kernel

Executing code will rely on sending an [`execute_request` to the `shell` channel](http://jupyter-client.readthedocs.org/en/latest/messaging.html#execute).

```javascript
var message = {
  header: {
    msg_id: `execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8`,
    username: 'rgbkrk',
    session: '00000000-0000-0000-0000-000000000000',
    msg_type: 'execute_request',
    version: '5.0',
  },
  content: {
    code: 'print("woo")',
    silent: false,
    store_history: true,
    user_expressions: {},
    allow_stdin: false,
  },
};
```

Until we make changes, you'll need to have at least one subscription before you can send on a channel.

```javascript
> shell.subscribe(console.log)
```

```javascript
> channels.shell.send(payload)
> Message {
  header:
   { username: 'rgbkrk',
     msg_type: 'execute_reply',
     msg_id: '0f6d37f3-56a2-41fd-b3ed-90cc189ac423',
     version: '5.1',
     session: '40472e70-e008-48d1-9537-55837a905c05',
     date: '2016-01-12T00:39:44.686986' },
  parent_header:
   { username: 'rgbkrk',
     session: '00000000-0000-0000-0000-000000000000',
     version: '5.0',
     msg_id: 'execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8',
     msg_type: 'execute_request' },
  metadata:
   { dependencies_met: true,
     engine: '34d73425-4f04-4b57-9bc7-b46e3100e1fd',
     status: 'ok',
     started: '2016-01-12T00:39:44.684534' },
  content:
   { status: 'ok',
     execution_count: 60,
     user_expressions: {},
     payload: [] } }
```
