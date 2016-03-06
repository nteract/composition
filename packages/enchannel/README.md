# enchannel

Enchannel is a spec for setting up communications between a frontend, like the [notebook](https://github.com/jupyter/notebook) or [jupyter-sidecar](https://github.com/nteract/jupyter-sidecar), and a backend kernel (the runtime, like Python, Julia, or R).  The enchannel spec describes both how to spawn kernels, shut them down, and communicate to them.

[![enchannel](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)

## Motivation

The core functionality of the notebook is to send messages from a frontend to a backend, and from a backend to a frontend ([or many frontends](https://github.com/nteract/jupyter-sidecar)). In the case of the Jupyter/IPython notebook, it communicates over websockets (which in turn reach out to ØMQ on the backend).

What if you want to serve the same HTML and Javascript for the notebook application itself while being able to work in a native ØMQ environment? What if websockets are fairly restricted in your working \*ahem\* *corporate* environment and you need to send data via `POST` and receive streaming updates using server-sent events?

We'd need a nice clean way to abstract the transport layer. Since [Jupyter is messages all the way down](http://jupyter-client.readthedocs.org/en/latest/messaging.html), one way is to hook up a series of event emitters all with the same interface. That's [definitely do-able](https://github.com/nteract/jupyter-transport-wrapper). Instead, let's rely on Observables: asynchronous data streams, [*from the future*](https://zenparsing.github.io/es-observable/). Observables are the multi-valued promise we've all been waiting for:
To spawn a kernel  

|                              | Single return value | Mutiple return values                  |
| ---------------------------- | ------------------- | -------------------------------------- |
| Pull/Synchronous/Interactive | Object              | Iterables (Array | Set | Map | Object) |
| Push/Asynchronous/Reactive   | Promise             | Observable                             |

The enchannel spec uses RxJS's observables implementation.

## Kernel life cycle

At the heart of enchannel is the `kernel` [subject](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/subjects.md).  To implement the enchannel spec and be an *enchannel-backend*, a *backend* must export a `kernel` subject.  This is the only top-level API required of *enchannel-backends*.  The `kernel` subject manages the life cycles of kernels.  To spawn a kernel, submit the name of the kernel spec to the subject:

```js
kernel.next('python3');
```

Spawning another kernel will close the last.  To explicitly close a kernel and/or when you're done with the `kernel` subject, complete the `kernel` subject:

```js
kernel.onCompleted();
```

## Kernel communications

When a kernel spawns, an object will be emitted on the `kernel` subject containing [subjects](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/subjects.md) for each communication channel of that kernel instance.  There will be between 4 and 5 channels:

```js
kernel.subscribe(channels => {
  const {
    shell,
    stdin,
    control,
    iopub,
    heartbeat, // (optional)
  } = channels;  
  // Place your fun code here!
});
```

*[For more information see the Jupyter client docks.](http://jupyter-client.readthedocs.org/en/latest/messaging.html)*

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

## Implementations

* [enchannel-zmq-backend](https://github.com/nteract/enchannel-zmq-backend)
* [enchannel-socketio-backend](https://github.com/nteract/enchannel-socketio-backend)

## References

* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* [RxJS (5.0)](https://github.com/ReactiveX/RxJS)
* [RxJS (4.0)](https://github.com/Reactive-Extensions/RxJS)
