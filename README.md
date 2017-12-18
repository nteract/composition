# nteract <img src="https://cloud.githubusercontent.com/assets/836375/15271096/98e4c102-19fe-11e6-999a-a74ffe6e2000.gif" alt="nteract animated logo" height="80px" align="right" />

[![](https://img.shields.io/badge/version-latest-blue.svg)](https://github.com/nteract/nteract)
[![Build Status](https://travis-ci.org/nteract/nteract.svg?branch=master)](https://travis-ci.org/nteract/nteract) [![Build status](https://ci.appveyor.com/api/projects/status/odxx4hrkcxh1oilx/branch/master?svg=true)](https://ci.appveyor.com/project/nteract/nteract/branch/master)
[![](https://img.shields.io/badge/version-stable-blue.svg)](https://github.com/nteract/nteract/releases)
[![codecov.io](https://codecov.io/github/nteract/nteract/coverage.svg?branch=master)](https://codecov.io/github/nteract/nteract?branch=master)
[![slack in](https://slackin-nteract.now.sh/badge.svg)](https://slackin-nteract.now.sh)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

|| [**Basics**](#basics) • [**Users**](#users) || [**Contributors**](#contributors) • [**Development**](#development) • [**Maintainers**](#maintainers) || [**Sponsors**](#sponsors) • [**Made possible by**](#made-possible-by) ||

## Basics

**nteract** is first and foremost a dynamic tool to give you flexibility when
writing code, exploring data, and authoring text to share insights about the
data.

**Edit code, write prose, and visualize.** 

* Share documents understood across the Jupyter ecosystem, [all in the comfort of a desktop app.](https://medium.com/nteract/nteract-revolutionizing-the-notebook-experience-d106ca5d2c38)
* [Explore new ways of working with compute and playing with data](https://play.nteract.io). 

We support [Jupyter kernels](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels)
locally on your system and on remote JupyterHubs via Binder.

## Users

### Installing the nteract desktop application

If you're here to install the nteract desktop app, visit 
[nteract.io](https://nteract.io) to download a binary and install or visit the
[releases page](https://github.com/nteract/nteract/releases/latest).

### Try the nteract playground

We're still hard at work on the playground. Here's a sneak peek to explore: https://play.nteract.io

---

## Contributors

The contributors are listed in the [contributors](https://github.com/nteract/nteract/graphs/contributors) page on GitHub.

To learn how to contribute to nteract, head on over to our [contributing guide](CONTRIBUTING.md).

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to rgbkrk@gmail.com.

Feel free to post issues on GitHub or chat with us in [Slack](https://nteract.slack.com/) ([request an invite](https://slackin-nteract.now.sh/)) if you need help or have
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

*Why have a monorepo?* The monorepo contains many components and packages that
can be mixed and remixed to create new applications. The monorepo keeps these
elements together so they are easy to discover and use.

### Getting Started

To get started developing, [set up the nteract monorepo](#set-the-monorepo-up-in-dev-mode).

#### Set the monorepo up in dev mode

Requires [Node.js and npm 3+](https://docs.npmjs.com/getting-started/installing-node).

1. Fork this repo
2. Clone your fork or this repo `git clone https://github.com/nteract/nteract`
3. `cd` to the directory where you `clone`d it
4. `npm install`

#### Building a specific package

In some cases you'll want to modify an individual base package (i.e. commutable
or transforms) and not rebuild all of the other packages. To target a build of a
specific package, use this command, replacing `packageName` with the package you
want to hack on:

```
$(npm bin)/lerna run build --scope packageName
```

### Hacking on the Desktop application

#### Quick and dirty (manual)

```
npm run app:desktop
```

As you make changes, you will have to close the entire app (CMD-q on macOS or
CNTL-c at the terminal) and then run `npm run app:desktop` again to see the
changes.

#### Progressive Webpack build (automatic)

In separate terminals run:

```
npm run build:desktop:watch
```

and

```
npm run spawn
```

This progressive webpack build will keep rebuilding as you modify the source
code. When you open a new notebook, you'll get the fresh, up-to-date copy of
the notebook app.

### Hacking on `play`

Run:

```
npm run app:play
```

Then open `127.0.0.1:3000` in your browser. You'll be able to make changes to
`play` and see the changes update live.

If you make changes to any `packages/` while hacking on `play`, you'll want to
rebuild those using [the instructions for building specific packages](#building-specific-packages).

### Troubleshooting

> I upgraded my developer installation and things are broken!

* Try `git clean -xdf && npm i`

> I want to debug redux actions and state changes.

* Enable [redux-logger](https://github.com/evgenyrodionov/redux-logger) by
  spawning the application with `npm run spawn:debug`.

> I keep getting a pop-up asking: *Do you want the application "nteract Helper.app" to accept
  incoming network connections?* while developing or using a custom build of
  nteract on macOS.

* This is how the the macOS firewall behaves for unsigned apps. On a signed app,
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

Follow instructions in [Releasing the Desktop application](https://github.com/nteract/nteract/blob/master/packages/desktop/RELEASING.md).

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
