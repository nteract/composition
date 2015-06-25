# jupyter-paths

[![NPM](https://nodei.co/npm/jupyter-paths.png)](https://nodei.co/npm/jupyter-paths/)

[![Travis for Jupyter Paths](https://travis-ci.org/nteract/jupyter-paths.svg)](https://travis-ci.org/nteract/jupyter-paths)

Node wrapping of jupyter/jupyter_core to resolve paths across Jupyter installations.

Requires Jupyter 4.0, particularly `jupyter_core` (not released yet).

```
npm install jupyter-paths
```

## Usage

```JavaScript
> jp = require('jupyter-paths')
> jp.paths.runtime
[ '/Users/rgbkrk/Library/Jupyter/runtime' ]
> jp.paths.data
[ '/Users/rgbkrk/Library/Jupyter',
  '/usr/local/Cellar/python/2.7.9/Frameworks/Python.framework/Versions/2.7/share/jupyter',
  '/usr/local/share/jupyter',
  '/usr/share/jupyter' ]
> jp.paths.config
[ '/Users/rgbkrk/.jupyter',
  '/usr/local/Cellar/python/2.7.9/Frameworks/Python.framework/Versions/2.7/etc/jupyter',
  '/usr/local/etc/jupyter',
  '/etc/jupyter' ]
> jp.paths.kernelspecs
[ '/Users/rgbkrk/Library/Jupyter/kernels',
  '/usr/local/Cellar/python/2.7.9/Frameworks/Python.framework/Versions/2.7/share/jupyter/kernels',
  '/usr/local/share/jupyter/kernels',
  '/usr/share/jupyter/kernels' ]
```
