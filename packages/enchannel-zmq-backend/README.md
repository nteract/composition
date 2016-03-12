# enchannel-zmq-backend

![enchannel version](https://img.shields.io/badge/enchannel-1.1-ff69b4.svg)

The ZeroMQ backend for [`enchannel`](https://github.com/nteract/enchannel). The classic edition, since Jupyter relies on ZeroMQ first and foremost.

## Installation

`npm install enchannel-zmq-backend`

### ZeroMQ Dependency

For all systems, you'll need

- [`npm`](https://docs.npmjs.com/getting-started/installing-node)
- [ZeroMQ](http://zeromq.org/intro:get-the-software)
- Python 2 (for builds - you can still run Python 3 code)

Each operating system has their own instruction set. Please read on down to save yourself time.

#### OS X

##### homebrew on OS X

- [`pkg-config`](http://www.freedesktop.org/wiki/Software/pkg-config/): `brew install pkg-config`
- [ZeroMQ](http://zeromq.org/intro:get-the-software): `brew install zeromq`

#### Windows

- You'll need a compiler! [Visual Studio 2013 Community Edition](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) is required to build zmq.node.
- Python (tread on your own or install [Anaconda](http://continuum.io/downloads))

After these are installed, you'll likely need to restart your machine (especially after Visual Studio).

#### Linux

For Debian/Ubuntu based variants, you'll need `libzmq3-dev` (preferred) or alternatively `libzmq-dev`.   
For RedHat/CentOS/Fedora based variants, you'll need `zeromq` and `zeromq-devel`.

## About

Provides functions to create [RxJS](https://github.com/ReactiveX/RxJS) subjects (`Observable`s and `Subscriber`s) for four of the Jupyter channels:

* `shell`
* `control`
* `iopub`
* `stdin`

## Usage

To get access to all of the `channels` for messaging, use `createChannels`:

```javascript
import { createChannels } from 'enchannel-zmq-backend'
```

The `createChannels` function accepts an identity and a kernel runtime object
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

To create the channels object:

```javascript
const channels = createChannels(identity, runtimeConfig)
const { shell, iopub, stdin, control } = channels;
```

`enchannel-zmq-backend` also exports four convenience functions to create specific channels

```javascript
import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';
```

Creating a subject for the `shell` channel:

```javascript
const shell = createShellSubject(identity, runtimeConfig)
```

### Subscribing to messages

Subscribing to iopub:

```javascript
const iopub = createIOPubSubject(identity, runtimeConfig);
var subscription = iopub.subscribe(msg => {
  console.log(msg);
}

// later, run subscription.unsubscribe()
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
> shell.next(payload)
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
