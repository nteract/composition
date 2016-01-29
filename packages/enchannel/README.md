# enchannel

Enchannel is a light spec for setting up communications between a frontend, like the [notebook](https://github.com/jupyter/notebook) or [jupyter-sidecar](https://github.com/nteract/jupyter-sidecar), and a backend kernel (the runtime, like Python, Julia, or R).

[![enchannel](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)

The core functionality of the notebook is to send messages from a frontend to a backend, and from a backend to a frontend ([or many frontends](https://github.com/nteract/jupyter-sidecar)). In the case of the Jupyter/IPython notebook, it communicates over websockets (which in turn reach out to ØMQ on the backend).

What if you want to serve the same HTML and Javascript for the notebook application itself while being able to work in a native ØMQ environment? What if websockets are fairly restricted in your working \*ahem\* *corporate* environment and you need to send data via `POST` and receive streaming updates using server-sent events?

We'd need a nice clean way to abstract the transport layer. Since [Jupyter is messages all the way down](http://jupyter-client.readthedocs.org/en/latest/messaging.html), one way is to hook up a series of event emitters all with the same interface. That's [definitely do-able](https://github.com/nteract/jupyter-transport-wrapper). Instead, let's rely on Observables: asynchronous data streams, [*from the future*](https://zenparsing.github.io/es-observable/). Observables are the multi-valued promise we've all been waiting for:

<table>
   <th></th><th>Single return value</th><th>Mutiple return values</th>
   <tr>
      <td>Pull/Synchronous/Interactive</td>
      <td>Object</td>
      <td>Iterables (Array | Set | Map | Object)</td>
   </tr>
   <tr>
      <td>Push/Asynchronous/Reactive</td>
      <td>Promise</td>
      <td>Observable</td>
   </tr>
</table>

Even better is to rely on RxJS's implementation, since we get a nice way to handle these streams:

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

In order to get this, we make 5 [RxJS Subjects](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/gettingstarted/subjects.md) for each of the [five sockets](http://jupyter-client.readthedocs.org/en/latest/messaging.html):

* Shell
* STDIN
* Control
* IOPub
* Heartbeat (optional)

Each backend has to implement this by providing an exported function that can take their choice of parameters, so long as they all allow for creating subjects for these.

Messages observed from these Subjects are all immutable, not by convention but through a recursive `Object.freeze`. 

Note that [heartbeat](http://jupyter-client.readthedocs.org/en/latest/messaging.html#heartbeat-for-kernels) is not included above, primarily because it's being thought of as something that may end up being deprecated.

## Implementations

* [enchannel-zmq-backend](https://github.com/nteract/enchannel-zmq-backend)

## References

* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* [RxJS (4.0)](https://github.com/Reactive-Extensions/RxJS)
* [RxJS (5.0)](https://github.com/ReactiveX/RxJS)
