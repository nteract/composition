# jupyter-paths

[![NPM](https://nodei.co/npm/jupyter-paths.png)](https://nodei.co/npm/jupyter-paths/)

[![Travis for Jupyter Paths](https://travis-ci.org/nteract/jupyter-paths.svg)](https://travis-ci.org/nteract/jupyter-paths)
[![Build status](https://ci.appveyor.com/api/projects/status/qkqb19u817f13bbr/branch/master?svg=true)](https://ci.appveyor.com/project/nteract/jupyter-paths/branch/master)
[![Greenkeeper badge](https://badges.greenkeeper.io/nteract/jupyter-paths.svg)](https://greenkeeper.io/)


Pure JavaScript implementation of `jupyter-paths`.

```
npm install jupyter-paths
```

## Usage

```JavaScript
$ node
> var jp = require('jupyter-paths')
```

### `runtimeDir()`

Returns immediately with the path to running kernels

```JavaScript
> jp.runtimeDir()
'/Users/rgbkrk/Library/Jupyter/runtime'
```

### `dataDirs()`

```JavaScript
> jp.dataDirs()
[ '/Users/rgbkrk/Library/Jupyter',
  '/usr/share/jupyter',
  '/usr/local/share/jupyter' ]
```

If you want the paths to include the `sys.prefix` paths (for Anaconda installs),
an optional `opts` parameter is accepted with key `withSysPrefix`. This changes
the return to a promise for you instead.

```JavaScript
> jp.dataDirs({ withSysPrefix: true })
Promise { <pending> }
> jp.dataDirs({ withSysPrefix: true }).then(console.log)
Promise { <pending> }
> [ '/Users/rgbkrk/Library/Jupyter',
  '/usr/local/Cellar/python/2.7.11/Frameworks/Python.framework/Versions/2.7/share/jupyter',
  '/usr/share/jupyter',
  '/usr/local/share/jupyter' ]
```

### `configDirs()`

Like `dataDirs`, an optional `opts` parameter is accepted with key
`withSysPrefix` as an argument.

```JavaScript
> jp.configDirs({ withSysPrefix: true }).then(console.log)
Promise { <pending> }
> [ '/Users/rgbkrk/.jupyter',
  '/usr/local/Cellar/python/2.7.11/Frameworks/Python.framework/Versions/2.7/etc/jupyter',
  '/usr/local/etc/jupyter',
  '/etc/jupyter' ]
```
