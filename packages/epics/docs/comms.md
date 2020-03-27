# Comm Epics

Comm epics are epics that support interacting with the Jupyter Messaging Protocol via comm messages. Comm messages are an arbitrary data exchange format built on top of the Jupyter messaging protocol.

A comm 

## commListenEpic

The `commListenEpic` is activated whenever a new kernel is successfully launched. This epic maps `comm_open` messages from the kernel to `COMM_OPEN` actions dispatched to the Redux store. it also maps `comm_msg` actions to `COMM_MSG` Redux actions.

This epic also includes some custom logic to handle processing comm messages that are specific to [ipywidgets](https://ipywidgets.readthedocs.io/en/latest/). See more below.

## ipywidgetsModel

This epic listens to comm messages targeting ipywidget's LinkModel construct and updates the nteract Redux state accordingly.