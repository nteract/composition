# enchannel-zmq-backend

![enchannel version](https://img.shields.io/badge/enchannel-1.1-ff69b4.svg)

**enchannel-zmq-backend** offers the ZeroMQ backend implementation for 
[`enchannel`](https://github.com/nteract/enchannel).

## Technical overview

As a refresher for the reader, *enchannel* details nteract's
lightweight, implementation-flexible specification for communication
between a user frontend and a backend, such as a language kernel. The 
*enchannel* specification offers a simple description of "what" 
messages may be passed between frontends and backends, while leaving
a developer freedom in "how" to achieve message communication.

**enchannel-zmq-backend** takes a classic design approach using ZeroMQ,
the foundation messaging protocol for the Jupyter project.
enchannel-zmq-backend implements backend support for the messaging
channels described in the [Jupyter messaging specification][]. This 
spec explains how front end clients should communicate with 
backend language kernels which implement the Jupyter messaging 
specification.

## Our backend

**enchannel-zmq-backend** implements the "how" to communicate messages
to and from a backend.

We provide functions to create [RxJS](https://github.com/ReactiveX/RxJS) 
subjects (`Observable` and `Subscriber` subjects) for four of the
channels described in the [Jupyter messaging specification][]:

* `shell`
* `control`
* `iopub`
* `stdin`

That's it. Functions for four channels; *simplicity in action*.

## Installation

Prerequisite: [Node.js and npm](https://docs.npmjs.com/getting-started/installing-node)

`npm install enchannel-zmq-backend`

## Usage

### Creating messaging channels

To get access to all of the `channels` for messaging (`shell`, `control`,
`iopub`, and `stdin`), import and use the `createChannels` function:

```javascript
import { createChannels } from 'enchannel-zmq-backend'
```

The `createChannels` function accepts two things: 

- an identity

    You'll want to set up your identity, relying on the node `uuid` package:
    
    ```javascript
    const uuid = require('uuid');
    const identity = uuid.v4();
    ```

- a runtime object, such as a kernel (which matches the on-disk JSON).

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

To create the channels *object*:

```javascript
const channels = createChannels(identity, runtimeConfig)
const { shell, iopub, stdin, control } = channels;
```

`enchannel-zmq-backend` also offers four convenience functions to 
easily create the messaging channels for `control`, `stdin`, `iopub`,
and `shell` :

```javascript
import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from 'enchannel-zmq-backend';
```

Creating a *subject* for the `shell` channel:

```javascript
const shell = createShellSubject(identity, runtimeConfig)
```

### Subscribing to messages

Here's an example about how to subscribe to `iopub` messages:

```javascript
const iopub = createIOPubSubject(identity, runtimeConfig);
var subscription = iopub.subscribe(msg => {
  console.log(msg);
}

// later, run subscription.unsubscribe()
```

Since these channels are RxJS Observables, you can use `filter`, `map`,
`scan` and many other RxJS operators:

```javascript
iopub.filter(msg => msg.header.msg_type === 'execute_result')
     .map(msg => msg.content.data)
     .subscribe(x => { console.log(`DATA! ${util.inspect(x)}`)})
```

### Sending messages to the kernel

Executing code will rely on sending an [`execute_request` to the `shell` channel][].

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

Currently, you'll need to have at least one subscription activated
before you can send on a channel.

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

## Contributors and developers

### ZeroMQ Dependency

If you plan to contribute to this project or extend it, you will need
to have ZeroMQ installed on your system.

For all systems, you'll need:

- [`npm`](https://docs.npmjs.com/getting-started/installing-node)
- [ZeroMQ](http://zeromq.org/intro:get-the-software)
- Python 2 (required for building the ZeroMQ dependency; you can still
  run Python 3 and Python 2 kernels and use both in the nteract notebook)

More detailed instructions for specific operating systems follow.

#### OS X using Homebrew

- [`pkg-config`](http://www.freedesktop.org/wiki/Software/pkg-config/): `brew install pkg-config`
- [ZeroMQ](http://zeromq.org/intro:get-the-software): `brew install zeromq`

#### Windows

- You'll need a compiler! [Visual Studio 2013 Community Edition](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) is required to build zmq.node.
- Python (tread on your own or install [Anaconda](http://continuum.io/downloads))

After these are installed, you'll likely need to restart your machine
(especially after installing Visual Studio).

#### Linux

Using your system's package manager, install the following packages
for your Linux flavor:

- For Debian/Ubuntu based variants: `libzmq3-dev` (preferred) or 
  alternatively `libzmq-dev`.
- For RedHat/CentOS/Fedora based variants: `zeromq` and `zeromq-devel`.

## Learn more about nteract

- Visit our website http://nteract.io/.
- See our organization on GitHub https://github.com/nteract
- Join us on [Slack](http://slack.nteract.in/) if you need help or have
  questions. If you have trouble creating an account, either
  email rgbkrk@gmail.com or post an issue on GitHub.

<img src="https://cloud.githubusercontent.com/assets/836375/15271096/98e4c102-19fe-11e6-999a-a74ffe6e2000.gif" alt="nteract animated logo" height="80px" />


[Jupyter messaging specification]: http://jupyter-client.readthedocs.io/en/latest/messaging.html
[`execute_request` to the `shell` channel]: http://jupyter-client.readthedocs.org/en/latest/messaging.html#execute