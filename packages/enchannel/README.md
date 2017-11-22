# enchannel

Enchannel is a lightweight spec for flexible communications between a
frontend, like the [notebook](https://github.com/jupyter/notebook) or
[jupyter-sidecar](https://github.com/nteract/jupyter-sidecar), and a backend
kernel (the runtime, like Python, Julia, or R).  Enchannel does not specify
the implementation or how the communications are constructed or destructed.

[![enchannel](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)

## Motivation

### Background
The core functionality of the notebook is to send messages from a frontend to
a backend, and from a backend to a frontend ([or many
        frontends](https://github.com/nteract/jupyter-sidecar)). In the case of the
Jupyter/IPython notebook, it communicates over websockets (which in turn reach
        out to ØMQ on the backend).

### What if...?
What if you want to serve the same HTML and Javascript for the notebook
application itself while being able to work in a native ØMQ environment? What
if websockets are fairly restricted in your working \*ahem\* *corporate*
environment and you need to send data via `POST` and receive streaming updates
using server-sent events?

### Solutions
Well, we'd need a nice, clean way to abstract the transport layer. As [Jupyter
is messages all the way
down](http://jupyter-client.readthedocs.org/en/latest/messaging.html), hooking
up a series of event emitters, all with the same interface, is one
abstraction. That's [definitely
do-able](https://github.com/nteract/jupyter-transport-wrapper).

Instead, let's rely on **Observables**: asynchronous data streams, [*from the
future*](https://zenparsing.github.io/es-observable/). Observables, as
flexible transport, are the multi-valued promise we've all been waiting for:

|                              | Single return value | Mutiple return values                  |
| ---------------------------- | ------------------- | -------------------------------------- |
| Pull/Synchronous/Interactive | Object              | Iterables (Array, Set, Map, Object) |
| Push/Asynchronous/Reactive   | Promise             | Observable                             |

Note: The enchannel spec uses RxJS's observables implementation.

---

## **enchannel** your data

### The spec
Kernel communications are described by a single object containing
[subjects](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/subjects.md),
each corresponding to a communication channel of the kernel instance.  There will
be between four and five channels:

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

Relying on RxJS's implementation of subjects means the streams can be handled
like so:

```javascript
    iopub.filter(msg => msg.header.msg_type === 'execute_result')
    .map(msg => msg.content.data)
.subscribe(x => { console.log(`DATA: ${util.inspect(x)}`)})
    ```

    As a benefit of subjects, we can go ahead and submit messages to the
    underlying transport:

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

Messages observed from these Subjects are all immutable, not by convention but
through a recursive `Object.freeze`.

Note that
[heartbeat](http://jupyter-client.readthedocs.org/en/latest/messaging.html#heartbeat-for-kernels)
is not included in the spec above primarily because it's an implementation
by-product and may end up being deprecated based on the chosen development
approach.

## Mutliplexed enchannel
`enchannel-zmq-backend` exposes a multiplexed subject that allows the developer
communicate with all four channels via a single interface.

```javascript
const channel = e.createMainChannel(identity, kernel.config);
const body = {
    header: {
        msg_id: `execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8`,
        username: "rgbkrk",
        session: "00000000-0000-0000-0000-000000000000",
        msg_type: "execute_request",
        version: "5.0"
    },
    content: {
        code: 'print("woo")',
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: false
    }
};
const message = { type: "shell", body };
channel.subscribe(console.log);
channel.next(message);
```

## Develop with us

To contribute to the spec or convenience functions, clone this repo and
install it by running the following from the repo root:

```
npm install
```

Before contributing changes to the utility functions, be kind to your peers
and check if the unit tests pass locally by running:

```
npm test
```

## Implementations

* [enchannel-zmq-backend](https://github.com/nteract/enchannel-zmq-backend)
* [enchannel-socketio-backend](https://github.com/nteract/enchannel-socketio-backend)

## References

* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* [RxJS (5.0)](https://github.com/ReactiveX/RxJS)
* [RxJS (4.0)](https://github.com/Reactive-Extensions/RxJS)
