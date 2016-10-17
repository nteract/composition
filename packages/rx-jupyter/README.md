# rx-jupyter

[![Build Status](https://travis-ci.org/nteract/rx-jupyter.svg?branch=master)](https://travis-ci.org/nteract/rx-jupyter)
[![codecov](https://codecov.io/gh/nteract/rx-jupyter/branch/master/graph/badge.svg)](https://codecov.io/gh/nteract/rx-jupyter)

rx-jupyter is a Reactive wrapper around the Jupyter Server API.  What is this
library useful for? It can help you query the services API on local and remote
instances of Jupyter and integrate it seamlessly with RxJS's functional tooling.

## Roadmap

Complete coverage of the [Jupyter Server API](http://jupyter-api.surge.sh/):

* [ ] Contents
  * [ ] Checkpoints
* [X] Kernels
* [X] Kernelspecs
* [ ] Sessions

### Development Install

To install `rx-jupyter` for development, do the following:

```
git clone https://github.com/nteract/rx-jupyter.git
cd rx-jupyter
npm install
```

Use `npm test` to run the test suite.
