# nteract <img src="https://cloud.githubusercontent.com/assets/836375/15271096/98e4c102-19fe-11e6-999a-a74ffe6e2000.gif" alt="nteract animated logo" height="80px" align="right" />

[![codecov.io](https://codecov.io/github/nteract/nteract/coverage.svg?branch=master)](https://codecov.io/github/nteract/nteract?branch=master)
[![slack in](https://slack.nteract.io/badge.svg)](https://slack.nteract.io)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![Circle CI status](https://circleci.com/gh/nteract/nteract/tree/master.svg?style=shield)](https://circleci.com/gh/nteract/nteract/tree/master)

|| [**Basics**](#basics) • [**Users**](#users) || [**Contributors**](#contributors) • [**Development**](#development) • [**Maintainers**](#maintainers) || [**Sponsors**](#sponsors) • [**Made possible by**](#made-possible-by) ||

## Basics

**nteract** is first and foremost a dynamic ecosystem to give you flexibility when
writing code, [exploring data](https://github.com/nteract/nteract/tree/master/packages/data-explorer), and authoring text to share insights about the
data.

**Build your own interactive computing experiences with nteract's core SDK.**

The nteract core SDK is an ecosystem of React components and JavaScript packages that give you the flexibility to build your own interactive computing experiences on top of the Jupyter ecosystem.

- Connect to remote Binder deployments using [rx-binder](https://github.com/nteract/nteract/tree/master/packages/rx-binder) and [host-cache](https://github.com/nteract/nteract/tree/master/packages/host-cache)
- Build clients on top of Jupyter servers running locally or remotely using [rx-jupyter](https://github.com/nteract/nteract/tree/master/packages/rx-jupyter)
- Build your own notebook UI using [presentational components](https://github.com/nteract/nteract/tree/master/packages/presentational-components)

**Edit code, write prose, and visualize with nteract's applications.**

- Share documents understood across the Jupyter ecosystem, [all in the comfort of a desktop app.](https://medium.com/nteract/nteract-revolutionizing-the-notebook-experience-d106ca5d2c38)
- [Explore new ways of working with compute and playing with data](https://play.nteract.io).
- Bring the nteract experience to your web-based Jupyter installation with the [nteract server extension](https://github.com/nteract/nteract/tree/master/applications/jupyter-extension).

We support [Jupyter kernels](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels)
locally on your system and on remote JupyterHubs via Binder.

## Using nteract's applications

### Installing the nteract desktop application

If you're here to install the nteract desktop app, visit
[nteract.io](https://nteract.io) to download a binary and install or visit the
[releases page](https://github.com/nteract/nteract/releases/latest). The nteract desktop app ships with a NodeJS kernel by default. If you'd like to use other Jupyter kernels, you will need to [install them](https://nteract.io/kernels).

### Installing nteract web

Our current flavor of nteract web runs on top of the Jupyter server. Install it with `pip`:

```
pip install nteract_on_jupyter
jupyter serverextension enable nteract_on_jupyter
```

Now, run `jupyter nteract` and you're running nteract on the Jupyter web application!

### Try the nteract playground

The nteract playground is a web-based application that allows you to write code and execute code in a web-based editor supported by Binder and Jupyter kernels. You can learn more about in the [nteract play GitHub repo](https://github.com/nteract/play).

### User Guide

To learn more about using the nteract desktop app, please check out the [user guide](https://github.com/nteract/nteract/blob/master/USER_GUIDE.md)

---

## Contributors

The contributors are listed in the [contributors](https://github.com/nteract/nteract/graphs/contributors) page on GitHub.

To learn how to contribute to nteract, head on over to our [contributing guide](CONTRIBUTING.md).

This project adheres to the Contributor Covenant [code of conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report unacceptable behavior to rgbkrk@gmail.com.

Feel free to post issues on GitHub or chat with us in [Slack](https://nteract.slack.com/) ([request an invite](https://slack.nteract.io/)) if you need help or have
questions. If you have trouble creating an account on Slack, please post an issue on GitHub.

## Development

### Overview of nteract's monorepo

This repository is a [monorepo](https://trunkbaseddevelopment.com/monorepos/), which basically
means that the repository hosts more than one module or application. In our
case, we have two main directories:

```
packages/ -- components used as an individual library
applications/ -- all the user facing applications (i.e. desktop)
```

The `packages` directory has the components needed to build new applications,
and the `applications` has the desktop app and the Jupyter extension.

_Why have a monorepo?_ The monorepo contains many components and packages that
can be mixed and remixed to create new applications. The monorepo keeps these
elements together so they are easy to discover and use. Another benefit
is that the monorepo makes it easy to iterate on applications that share
common components. For example, if we update a component, such as the Jupyter
message handling, and happen to introduce an issue when making a change to the
desktop app, we would notice the issue in tandem.

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
specific package, use this command, replacing `packageName` with the fully qualified name of the package you want to build:

```
tsc -b packageName
```

For example, to hack on the `transforms` package, use

```
tsc -b packages/transforms
```

### Hacking on the web application

If you're looking to test out changes you make to the core SDK, the web application is the best integrated environment to test on. You can run the web application in development mode, by [configuring the Jupyter extension to run in development mode](https://github.com/nteract/nteract/blob/master/applications/jupyter-extension/README.md#development).

### Hacking on the desktop application

#### Quick and dirty (manual)

```
yarn app:desktop
```

As you make changes, you will have to close the entire app (CMD-q on macOS or
CTRL-c at the terminal) and then run `yarn app:desktop` again to see the
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

## Sponsors

Work on the nteract notebook is currently sponsored by

[![NumFocus](https://numfocus.org/wp-content/uploads/2017/07/NumFocus_LRG.png)](https://numfocus.salsalabs.org/donate-to-nteract/index.html)

We're on a common mission to build a great interactive computing experience. You can help by:

- QAing the desktop application and helping create meaningful bug reports
- Providing support on GitHub issues or the Slack team
- Donating money to nteract, which is a non-profit fiscally sponsored by NumFOCUS
- Contributing your organization's engineering hours to the nteract project

## Made possible by

The nteract project was made possible with the support of

[![Netflix OSS](https://netflix.github.io/images/Netflix-OSS-Logo.png)](https://netflix.github.io/)

<a href="https://opensource.microsoft.com"><img src="https://user-images.githubusercontent.com/1857993/68797361-4f1d1600-0609-11ea-9421-24148b6d2b5a.png" alt="Microsoft" width="350px"/></a>

If your employer allows you to work on nteract during the day and would like
recognition, feel free to add them to this "Made possible by" list.

|| [**Basics**](#basics) • [**Users**](#users) || [**Contributors**](#contributors) • [**Development**](#development) • [**Maintainers**](#maintainers) || [**Sponsors**](#sponsors) • [**Made possible by**](#made-possible-by) ||
