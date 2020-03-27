# Comm Epics

Comm epics, more formally Communication Epics, are epics that support interacting with the
[Jupyter Messaging Protocol](https://jupyter-client.readthedocs.io/en/stable/messaging.html)
via comm messages.

A few years ago, Jupyter added a
[custom messaging](https://jupyter-client.readthedocs.io/en/stable/messaging.html#custom-messages)
system for developers to add their own objects with Front-end and Kernel-side components,
and allow them to communicate with each other. To do this, IPython adds a notion of a `Comm`,
which exists on both sides (Front end and Kernel), and can communicate in either direction.
As such, Comm messages are an arbitrary data exchange format built on top of the
Jupyter Messaging Protocol.

Comm messages are one-way communications to update comm state,
used for synchronizing widget state, or simply requesting actions of a comm's counterpart
(kernel-side request to front end or front-end request to kernel-side).

## commListenEpic

The `commListenEpic` is activated whenever a new kernel is successfully launched.

This epic, `commListenEpic`:

- maps `comm_open` kernel messages to `COMM_OPEN` actions dispatched to the Redux store
- maps `comm_msg` actions to `COMM_MSG` Redux actions.

This epic also includes some custom logic to handle processing comm messages that are
specific to [ipywidgets](https://ipywidgets.readthedocs.io/en/latest/). See more below.

## ipywidgetsModel

This epic listens to comm messages targeting ipywidget's `LinkModel` construct and updates
the nteract Redux state accordingly.
