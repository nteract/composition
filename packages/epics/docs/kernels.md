# Kernels Epics

## Kernel Lifecycle

https://jupyter-client.readthedocs.io/en/stable/api/manager.html#manager-starting-stopping-signalling

### acquireKernelInfoEpic

### launchKernelWhenNotebookSetEpic

### watchExecutionStateEpic

### restartKernelEpic

## Kernelspecs

Kernelspecs contain information about kernels, such as language, location, and how to launch.
Collectively, kernelspecs aid in the discovery of available kernels for a front-end to use.
See the [JupyterClient API about kernelspecs](https://jupyter-client.readthedocs.io/en/stable/api/kernelspec.html#kernelspec-discovering-kernels)
for more information.

### fetchKernelspecsEpic

## Websocket Kernel

The Websocket Kernel epics deal with starting, stopping, and signalling the management of a
language kernel.
The [JupyterClient API](https://jupyter-client.readthedocs.io/en/stable/api/manager.html#manager-starting-stopping-signalling)
provides additional details on interacting with websocket kernels.

### launchWebSocketKernelEpic

### changeWebSocketKernelEpic

### interruptKernelEpic

### killKernelEpic

### restartWebSocketKernelEpic
