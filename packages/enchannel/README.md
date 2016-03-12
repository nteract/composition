# enchannel

Enchannel is a light spec for communications between a frontend, like the [notebook](https://github.com/jupyter/notebook) or [jupyter-sidecar](https://github.com/nteract/jupyter-sidecar), and a backend kernel (the runtime, like Python, Julia, or R).  Enchannel does not specify how the communications are constructed or destructed.

[![enchannel](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)

## Motivation

The core functionality of the notebook is to send messages from a frontend to a backend, and from a backend to a frontend ([or many frontends](https://github.com/nteract/jupyter-sidecar)). In the case of the Jupyter/IPython notebook, it communicates over websockets (which in turn reach out to ØMQ on the backend).

What if you want to serve the same HTML and Javascript for the notebook application itself while being able to work in a native ØMQ environment? What if websockets are fairly restricted in your working \*ahem\* *corporate* environment and you need to send data via `POST` and receive streaming updates using server-sent events?

We'd need a nice clean way to abstract the transport layer. Since [Jupyter is messages all the way down](http://jupyter-client.readthedocs.org/en/latest/messaging.html), one way is to hook up a series of event emitters all with the same interface. That's [definitely do-able](https://github.com/nteract/jupyter-transport-wrapper). Instead, let's rely on Observables: asynchronous data streams, [*from the future*](https://zenparsing.github.io/es-observable/). Observables are the multi-valued promise we've all been waiting for:

|                              | Single return value | Mutiple return values                  |
| ---------------------------- | ------------------- | -------------------------------------- |
| Pull/Synchronous/Interactive | Object              | Iterables (Array | Set | Map | Object) |
| Push/Asynchronous/Reactive   | Promise             | Observable                             |

The enchannel spec uses RxJS's observables implementation.

## Kernel communications

Communications are described by a single object containing [subjects](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/subjects.md) for each communication channel of that kernel instance.  There will be between 4 and 5 channels:

```js
const {
  shell,
  stdin,
  control,
  iopub,
  heartbeat, // (optional)
} = channelsObject;  
```

*[For more information see the Jupyter client docs.](http://jupyter-client.readthedocs.org/en/latest/messaging.html)*

Relying on RxJS's implementation of subjects means the streams can be handled like so:

```javascript
iopub.filter(msg => msg.header.msg_type === 'execute_result')
     .map(msg => msg.content.data)
     .subscribe(x => { console.log(`DATA: ${util.inspect(x)}`)})
```

On top of that, since these are subjects, we can go ahead and submit messages to the underlying transport:

```javascript
var message = {
  header: {
    msg_id: `execute_${uuid.v4()}`,
    username: '',
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

shell.next(message); // send the message
```

Messages observed from these Subjects are all immutable, not by convention but through a recursive `Object.freeze`.

Note that [heartbeat](http://jupyter-client.readthedocs.org/en/latest/messaging.html#heartbeat-for-kernels) is not included above, primarily because it's being thought of as something that may end up being deprecated.

## What's in this repo?

In addition to the spec doc itself (the text above) this repo contains convenience functions for enchannel implementations and consumers.  To use these functions install this package with npm

    npm install enchannel

The utility functions included are described below

#### isChildMessage
Checks to see if one message is child to another.  Accepts two arguments, parent and child, both of which are [Jupyter message objects](https://ipython.org/ipython-doc/3/development/messaging.html#general-message-format).  To use as a conditional:

```js
const enchannel = require('enchannel');
if (enchannel.isChildMessage(parent, child)) {
  console.log('is child');
}
```

It will probably make more sense to use it as an observable filter.  In the example below, `parent` is a [Jupyter message object](https://ipython.org/ipython-doc/3/development/messaging.html#general-message-format) and `channels.iopub` is an RxJS observable:

```js
const enchannel = require('enchannel');
const isChildMessage = enchannel.isChildMessage.bind(null, parent);
const childMessages = channels.iopub.filter(isChildMessage);
```

#### createMessage
Creates a [Jupyter message object](https://ipython.org/ipython-doc/3/development/messaging.html#general-message-format).  Accepts 3 arguments:

 - username, string  
 - session, string,  guid unique to the current session  
 - msg_type: string, type of the message getting sent  

The following is a full example that shows how connection may happen, how you'd setup the session and username, and then create and send a shutdown request:

```js
// The method to connect is specific to the enchannel backend implementation
enchannelBackend.connect().then(channels => {

  // Created once with the channels
  const uuid = require('node-uuid');
  const session = uuid.v4();
  const username = process.env.LOGNAME || process.env.USER ||
    process.env.LNAME || process.env.USERNAME;

  // Create the shutdown request method
  const enchannel = require('enchannel');
  const shutdownRequest = enchannel.createMessage(username, session, 'shutdown_request');
  shutdownRequest.content = { restart: false };

  // Send it
  // Before sending, don't forget to subscribe to the channel you are sending on!  In practice
  // there is more code involved here, because you'd want to filter the messages your subscribing
  // to for messages that are child to the one that you send.
  channels.shell.subscribe(content => { /* ... */ });
  channels.shell.next(shutdownRequest);
});
```

#### shutdownRequest
Sends a [shutdown request Jupyter message](https://ipython.org/ipython-doc/3/development/messaging.html#kernel-shutdown) to the kernel and completes the observables.  Accepts 3 arguments:

 - username, string  
 - session, string,  guid unique to the current session  
 - channels: object, enchannel channels object
 - restart: optional boolean, whether the shutdown request is actually a restart request

The following full example shows how this method would be used:

```js
const enchannel = require('enchannel');
console.log('begin shutdown');
enchannel.shutdownRequest(username, session, channels, restart).then(() => {
  console.log('finished shutting down');
});
```

## Development

To contribute to the spec or utility functions, clone this repo and install it by running the following from the repo root:

    npm install

Before contributing any changes to the utility functions, make sure the unit tests pass locally by running:

    npm test

## Implementations

* [enchannel-zmq-backend](https://github.com/nteract/enchannel-zmq-backend)
* [enchannel-socketio-backend](https://github.com/nteract/enchannel-socketio-backend)

## References

* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* [RxJS (5.0)](https://github.com/ReactiveX/RxJS)
* [RxJS (4.0)](https://github.com/Reactive-Extensions/RxJS)
