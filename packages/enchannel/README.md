# enchannel

Enchannel is a light spec for setting up communications between a frontend, like the notebook or jupyter-sidecar, and a backend kernel (the runtime, like Python, Julia, or R).

[![enchannel](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)

The core functionality of the notebook is to send messages from a frontend to a backend, and a backend to a frontend ([or many frontends](https://github.com/nteract/jupyter-sidecar)).

In the case of the Jupyter/IPython notebook, it communicates over websockets (which in turn reach out to 0MQ).

What if you want to serve the same HTML and Javascript for the notebook application itself while being able to work in a native 0MQ environment? What if websockets are fairly restricted in your *ahem corporate* environment and you need to do e.g. `POST`ing + Server Sent Events?

We'd need a nice clean way to abstract the transport layer. Since Jupyter is messages all the way down, one way is to hook up a series of event emitters all with the same interface. That's [definitely do-able](https://github.com/nteract/jupyter-transport-wrapper). What is proposed here is that we would rely on `Observable`s, asynchronous data streams. Even better is to rely on RxJS's implementation, since we get a nice functional approach to messages.


