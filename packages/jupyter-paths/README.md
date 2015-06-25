# jupyter-paths

[![NPM](https://nodei.co/npm/jupyter-paths.png)](https://nodei.co/npm/jupyter-paths/)

[![Travis for Jupyter Paths](https://travis-ci.org/nteract/jupyter-paths.svg)](https://travis-ci.org/nteract/jupyter-paths)

Node wrapping of jupyter/jupyter_core to resolve paths across Jupyter installations.

```
npm install jupyter-paths
```

## Usage

```JavaScript
> jp = require('jupyter-paths')
> jp.paths.kernelspecs
[ '/Users/kyle6475/Library/Jupyter/kernels',
  '/usr/local/Cellar/python/2.7.9/Frameworks/Python.framework/Versions/2.7/share/jupyter/kernels',
  '/usr/local/share/jupyter/kernels',
  '/usr/share/jupyter/kernels' ]
```
