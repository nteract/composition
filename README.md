![nteract animated logo](https://cloud.githubusercontent.com/assets/836375/15271096/98e4c102-19fe-11e6-999a-a74ffe6e2000.gif)

[![codecov.io](https://codecov.io/github/nteract/nteract/coverage.svg?branch=master)](https://codecov.io/github/nteract/nteract?branch=master)
[![Build Status](https://travis-ci.org/nteract/nteract.svg)](https://travis-ci.org/nteract/nteract) [![slack in](http://slack.nteract.in/badge.svg)](http://slack.nteract.in)

## Overview

:notebook: It's an Electron-based Notebook! :notebook:

![nteract demo](https://cloud.githubusercontent.com/assets/836375/14068164/6ebbc6ea-f42f-11e5-98bc-eb149d0b0730.gif)

Note: this isn't feature complete yet. There will be :bug:s and we're currently
lacking a lot of core features like jupyter-js-widgets, introspection, cut/copy/paste of cells.

### Scope and goals

* Notebook environment to explore and get things done
* Standalone cross-platform desktop application
* Easy install with pre-configured Python3 and JavaScript runtimes
* Grow an ecosystem of tooling to allow others to build their own platforms relying on the Jupyter specifications

### Contributing

The contributors are listed in [contributors](https://github.com/nteract/nteract/graphs/contributors)

nteract uses the [C4.1 (Collective Code Construction Contract)](http://rfc.zeromq.org/spec:22) process for contributions.

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to rgbkrk@gmail.com.

### Design

* Full compliance with [Jupyter message spec v5](http://jupyter-client.readthedocs.org/en/latest/messaging.html)
* Full compliance with [Notebook format v4](http://nbformat.readthedocs.org/en/latest/format_description.html)
* Follow notebook model operations flow from [commutable](https://github.com/nteract/commutable)
* Rely on common interfaces for kernel communication via [enchannel's comm spec](https://github.com/nteract/enchannel) (Go read it!)
* Mocks for UI can be explored in issues, while design references go in [mocks](https://github.com/nteract/mocks)
* React for views (pushing notebook state down into the view)
* Full node, direct to zmq (no running a Python server underneath)

### Development

To get started developing install a [python runtime](#python-runtime), the
[dependencies](#dependencies) and [`nteract` itself](#install-nteract-itself).

#### Python runtime

At least for now, we need the python 3 kernel installed when hacking on nteract:

```
python3 -m pip install ipykernel
python3 -m ipykernel install --user
```

#### Dependencies

For all systems, you'll need

- Node.js 5.x
- [`npm`](https://docs.npmjs.com/getting-started/installing-node)
- [ZeroMQ](http://zeromq.org/intro:get-the-software)
- Python 2 (for builds - you can still run Python 3 code)

Each operating system has their own instruction set. Please read on down to save yourself time.

##### OS X

###### homebrew on OS X

- [`pkg-config`](http://www.freedesktop.org/wiki/Software/pkg-config/): `brew install pkg-config`
- [ZeroMQ](http://zeromq.org/intro:get-the-software): `brew install zeromq`

##### Windows

- You'll need a compiler! [Visual Studio 2013 Community Edition](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) is required to build zmq.node.
- Python (tread on your own or install [Anaconda](http://continuum.io/downloads))

After these are installed, you'll likely need to restart your machine (especially after Visual Studio).

##### Linux

For Debian/Ubuntu based variants, you'll need `libzmq3-dev` (preferred) or alternatively `libzmq-dev`.   
For RedHat/CentOS/Fedora based variants, you'll need `zeromq` and `zeromq-devel`.

#### Install `nteract` itself

Requires node 5.x and npm 3.

1. Fork this repo
2. Clone it `git clone https://github.com/nteract/nteract`
3. `cd` to where you `clone`d it
4. `npm install`
5. `npm run start`

Assets are compiled via electron-compile directly, no build steps until we make a release. As you hack on components, you can reload directly or pop open the dev console and run `location.reload()`. No hot reloading at the moment.

#### Troubleshooting

> I did: "$ npm install", and I got: "Authorization service failure : @reactivex/rxjs"

- Try `$ npm login` then `$ npm install`
- Try `$ npm install @reactivex/rxjs; npm install;`
- Try `$ npm install @reactivex/rxjs@5.0.0-beta.2; npm install;`

> I did: "$ npm install" then "$ npm start", and I got: "no such file or directory, open '.../node_modules/electron-prebuilt/path.txt'"

- Try `$ npm install electron-prebuilt`

### Frontend background

As much as possible, we'd like to get people speaking a common language for
development of nteract components and packages.

Core tech behind the scenes:

* [Observables](http://cycle.js.org/observables.html) through [RxJS](https://github.com/ReactiveX/RxJS)
* [React](https://facebook.github.io/react/)
* [Jupyter Messaging](http://jupyter-client.readthedocs.org/en/latest/messaging.html)
* [ZeroMQ](http://zguide.zeromq.org/page:all)

These are our suggested tutorials and background to help you get up to speed:

* [Build your own REPL with enchannel](https://github.com/nteract/docs/blob/master/enchannel/build-your-own-repl.md)
* [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)
* [Full Stack Redux Tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)

Depending on where you plug yourself in, you may find the introduction to Reactive
programming is the biggest help.

If you'd like to experiment with the core Jupyter messaging and Observables
without working with React, check out [ick](https://github.com/nteract/ick),
an interactive console.

Post in [Slack](http://slack.nteract.in/) if you need help with these or have questions. Several people
are working through tutorials right now and would love a study group! If you have trouble creating an account, either email rgbkrk@gmail.com or post an issue on GitHub.

### Support

#### Sponsors

Work on the nteract notebook is currently sponsored by

[![Plotly](https://cloud.githubusercontent.com/assets/836375/13661288/0f1d6d8c-e657-11e5-897b-9d047cb30ef4.png)](https://plot.ly/)

[![Domino Data Lab](https://cloud.githubusercontent.com/assets/836375/13661281/052c8506-e657-11e5-8e93-1497c6097519.png)](https://www.dominodatalab.com/)

We're on a common mission to build a great notebook experience. Feel free to
[get in touch](mailto:rgbkrk@gmail.com) if you'd like to help. Resources go towards
paying for additional work by seasoned designers and engineers.

#### Made possible by

The nteract project was made possible with the support of

[![Carina by Rackspace](https://657cea1304d5d92ee105-33ee89321dddef28209b83f19f06774f.ssl.cf1.rackcdn.com/carina-logo-69ecb9689d028f8d8f0db1caad4b95472040cb3af32104bbc98716fe2088dca4.svg)](https://getcarina.com).

If your employer allows you to work on nteract during the day and would like
recognition, feel free to add them to the "Made possible by" list.
