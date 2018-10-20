# nteract <img src="https://cloud.githubusercontent.com/assets/836375/15271096/98e4c102-19fe-11e6-999a-a74ffe6e2000.gif" alt="nteract animated logo" height="80px" align="right" />

[![](https://img.shields.io/badge/version-latest-blue.svg)](https://github.com/nteract/nteract)
[![](https://img.shields.io/badge/version-stable-blue.svg)](https://github.com/nteract/nteract/releases)
[![codecov.io](https://codecov.io/github/nteract/nteract/coverage.svg?branch=master)](https://codecov.io/github/nteract/nteract?branch=master)
[![slack in](https://slack.nteract.io/badge.svg)](https://slack.nteract.io)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![Azure Pipelines CI status](https://dev.azure.com/nteract/nteract/_apis/build/status/nteract.nteract?branch=master)](https://dev.azure.com/nteract/nteract/_build/latest?definitionId=1&branch=master)
[![Circle CI Status Shield](https://circleci.com/gh/nteract/nteract/tree/master.svg?style=shield)](https://circleci.com/gh/nteract/nteract/tree/master)

|| [**Basics**](#basics) • [**Users**](#users) || [**Contributors**](#contributors) • [**Development**](#development) • [**Maintainers**](#maintainers) || [**Sponsors**](#sponsors) • [**Made possible by**](#made-possible-by) ||

## Basics

**nteract** is first and foremost a dynamic tool to give you flexibility when
writing code, [exploring data](https://github.com/nteract/nteract/tree/master/packages/transform-dataresource), and authoring text to share insights about the
data.

**Edit code, write prose, and visualize.**

- Share documents understood across the Jupyter ecosystem, [all in the comfort of a desktop app.](https://medium.com/nteract/nteract-revolutionizing-the-notebook-experience-d106ca5d2c38)
- [Explore new ways of working with compute and playing with data](https://play.nteract.io).

We support [Jupyter kernels](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels)
locally on your system and on remote JupyterHubs via Binder.

## Users

### Installing the nteract desktop application

If you're here to install the nteract desktop app, visit
[nteract.io](https://nteract.io) to download a binary and install or visit the
[releases page](https://github.com/nteract/nteract/releases/latest).

### Installing nteract web

Our current flavor of nteract web runs on top of the jupyter server. Install it with `pip`:

```
pip install nteract_on_jupyter
```

Now, run `jupyter nteract` and you're running nteract on jupyter!

### Try the nteract playground

We're still hard at work on the playground. Here's a sneak peek to explore: https://play.nteract.io

### User Guide

For the user guide, please check [USER_GUIDE.md](https://github.com/nteract/nteract/blob/master/USER_GUIDE.md)

---

## Contributors

The contributors are listed in the [contributors](https://github.com/nteract/nteract/graphs/contributors) page on GitHub.

To learn how to contribute to nteract, head on over to our [contributing guide](CONTRIBUTING.md).

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to rgbkrk@gmail.com.

Feel free to post issues on GitHub or chat with us in [Slack](https://nteract.slack.com/) ([request an invite](https://slack.nteract.io/)) if you need help or have
questions. If you have trouble creating an account on Slack, either email
rgbkrk@gmail.com or post an issue on GitHub.

## Development

### Overview of nteract's monorepo

This repository is a [monorepo](./doc/design/monorepo.md), which basically
means that the repository hosts more than one module or application. In our
case, we have two main directories:

```
packages/ -- components used as an individual library
applications/ -- all the user facing applications (i.e. desktop, play)
```

The `packages` directory has the components needed to build new applications,
and the `applications` has the desktop app, the play app, and a few more.

_Why have a monorepo?_ The monorepo contains many components and packages that
can be mixed and remixed to create new applications. The monorepo keeps these
elements together so they are easy to discover and use. Another benefit
is that the monorepo makes it easy to iterate on applications that share
common components. For example, if we update a component, such as the Jupyter
message handling, and happen to introduce an issue when making a change to the
desktop app and happened to break it for use by play.nteract.io web app we would
notice the issue in tandem.

### Getting Started

To get started developing, [set up the nteract monorepo](#set-the-monorepo-up-in-dev-mode).

#### Set the monorepo up in dev mode

Requires [Node.js](https://docs.npmjs.com/getting-started/installing-node) and [yarn](https://yarnpkg.com/lang/en/docs/install/).

1. Fork this repo
2. Clone your fork or this repo `git clone https://github.com/nteract/nteract`
3. `cd` to the directory where you `clone`d it
4. `yarn install`

To keep up-to-date with changes to the root nteract/nteract branch:

5. Set the root as a remote: `git remote add upstream https://github.com/nteract/nteract.git`

When changes are made to the root nteract/nteract, they can then be pulled from the root and merged to your master branch:

6. `git pull upstream master`
7. `yarn clean`
8. `yarn install`

#### Building a specific package

In some cases you'll want to modify an individual base package (i.e. commutable
or transforms) and not rebuild all of the other packages. To target a build of a
specific package, use this command, replacing `packageName` with the fully qualified name of the package you
want to hack on:

```
yarn build:only packageName
```

For example, to hack on the `transforms` package, use

```
yarn build:only @nteract/transforms
```

### Hacking on the Desktop application

#### Quick and dirty (manual)

```
yarn app:desktop
```

As you make changes, you will have to close the entire app (CMD-q on macOS or
CNTL-c at the terminal) and then run `yarn app:desktop` again to see the
changes.

#### Progressive Webpack build (automatic)

In separate terminals run:

```
yarn build:desktop:watch
```

and

```
yarn spawn
```

This progressive webpack build will keep rebuilding as you modify the source
code. When you open a new notebook, you'll get the fresh, up-to-date copy of
the notebook app.

#### Logging

`console.log` statements in the main Electron process are piped to stdout.
`console.log` statements in the Electron renderer process go to the
regular Dev Tools console (accessible from the View menu). Set
ELECTRON_ENABLE_LOGGING=1 to pipe renderer `console.log` to the launching
terminal as well. This is useful for debugging crashes and notebook closing
behaviors.

### Hacking on `play`

Run:

```
yarn app:play
```

Then open `127.0.0.1:3000` in your browser. You'll be able to make changes to
`play` and see the changes update live.

If you make changes to any `packages/` while hacking on `play`, you'll want to
rebuild those using [the instructions for building specific packages](#building-a-specific-package).

### Troubleshooting

> I upgraded my developer installation and things are broken!

- Try `yarn clean && yarn`

> I want to debug redux actions and state changes.

- Enable [redux-logger](https://github.com/evgenyrodionov/redux-logger) by
  spawning the application with `yarn spawn:debug`.

> I keep getting a pop-up asking: _Do you want the application "nteract Helper.app" to accept
> incoming network connections?_ while developing or using a custom build of
> nteract on macOS.

- This is how the the macOS firewall behaves for unsigned apps. On a signed app,
  the dialog won't show up again after approving it the first time. If you're
  using a custom build of nteract, run:

  ```
  sudo codesign --force --deep --sign - /Applications/nteract.app
  ```

  You will have to do this again every time you rebuild the app.

---

## Maintainers

### Creating a release

#### Individual packages

Allow lerna to publish all of `packages/*`

```
$ lerna publish
... follow prompts to publish any packages, choosing the appropriate semver
```

#### Desktop application

Follow instructions in [Releasing the Desktop application](https://github.com/nteract/nteract/blob/master/RELEASING.md).

---

## Sponsors

Work on the nteract notebook is currently sponsored by

[![NumFocus](https://www.flipcause.com/uploads/thumb_NumFocus_2C_RGB.png)](http://www.numfocus.org/)

We're on a common mission to build a great notebook experience. Feel free to
[get in touch](mailto:rgbkrk@gmail.com) if you'd like to help. Resources go towards
paying for additional work by seasoned designers and engineers.

## Made possible by

The nteract project was made possible with the support of

[![Netflix OSS](https://netflix.github.io/images/Netflix-OSS-Logo.png)](https://netflix.github.io/)

If your employer allows you to work on nteract during the day and would like
recognition, feel free to add them to this "Made possible by" list.

|| [**Basics**](#basics) • [**Users**](#users) || [**Contributors**](#contributors) • [**Development**](#development) • [**Maintainers**](#maintainers) || [**Sponsors**](#sponsors) • [**Made possible by**](#made-possible-by) ||
