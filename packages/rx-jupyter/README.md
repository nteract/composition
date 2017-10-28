# rx-jupyter

[![Build Status](https://travis-ci.org/nteract/rx-jupyter.svg?branch=master)](https://travis-ci.org/nteract/rx-jupyter)
[![codecov](https://codecov.io/gh/nteract/rx-jupyter/branch/master/graph/badge.svg)](https://codecov.io/gh/nteract/rx-jupyter)

**rx-jupyter** is a Reactive wrapper around the [Jupyter Server API].

## Why use rx-jupyter?

**rx-jupyter** can help you query local and remote Jupyter Server instances
using Jupyter's Services API. Also, **rx-jupyter** integrates responses
seamlessly with [RxJS]'s functional tooling.

## Roadmap

Complete coverage of the [Jupyter Server API]:

* [ ] Contents
  * [ ] Checkpoints
* [X] Kernels
* [X] Kernelspecs
* [ ] Sessions

## Development Install

To install `rx-jupyter` for development, do the following:

```
git clone https://github.com/nteract/rx-jupyter.git
cd rx-jupyter
npm install
```
## Testing

Use `npm test` to run the test suite.


[Jupyter Server API]: http://jupyter-api.surge.sh/
[RxJS]: http://reactivex.io
