# enchannel

Enchannel is a light spec for setting up communications between a frontend, like the notebook or jupyter-sidecar, and a backend kernel (the runtime, like Python, Julia, or R).

[![enchannel](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)](https://cloud.githubusercontent.com/assets/836375/12282043/b19bb16e-b960-11e5-8661-ce2111ec0417.png)

The core functionality of the notebook is to send messages from a frontend to a backend, and a backend to a frontend ([or many frontends](https://github.com/nteract/jupyter-sidecar)).

In the case of the Jupyter/IPython notebook, it communicates over websockets (which in turn reach out to 0MQ).

