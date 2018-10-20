# Roadmap of the nteract Desktop App

This document is a roadmap of future releases of the nteract desktop application.
We focus on small, lean, and iterative releases. This document will give you
the sense of our overall vision and future work on the project.

## Pre-alpha (Completed)
We want to start making packaged releases so that we can begin evaluating the
desktop experience more fully. In other words, to be able to start testing the
usability of our notebook. It is expected that we'll make lots of pre-alpha
"releases" to get the shipping flow down.

* Packaging and Installation
    * Ability to open and run a notebook from the desktop
    * Packaged release of "nteract-lite" (no bundled kernel) for macOS and Linux
* Specification Compliance
    * Full compliance with Notebook format v4
    * Full compliance with message spec v5
* Testing coverage > 50%

## Alpha

* Packaging and Installation
    * ~~macOS and Linux packaged release~~
* ~~Specification Compliance~~
    * ~~Read compliance with Notebook format v3 (v4 is already supported)~~
* ~~Notebook Functionality~~
    * ~~Inline and block mathematics via LaTeX (https://github.com/nteract/mathjax-electron)~~
    * ~~Code completion and introspection~~
    * ~~Clipboard~~
* Communication
    * Comm message handling (preliminary/provisional API)
* ~~Testing coverage > 70%~~

A big part of the notebook is the ecosystem of libraries that rely on it. We need
to make sure that we support many of the common libraries in use across Python,
Julia, R, and JavaScript. We need to insure that we are supporting the following
libraries.

* ~~Plotly~~
* Bokeh
* ipywidgets
* Matplotlib (`%matplotlib notebook`)
* Julia's Gadfly

## Beta
Beta should be feature-complete (relative to the Jupyter Notebook) and stable
enough for a wide class of users to trust with running their notebooks in.

* Testing coverage >= 90%

## Release Candidate

* Packaging and Installation
    * Bundled Python kernel
    * Installers for all platforms
* ~~Notebook Publishing~~
  * ~~gists~~
* Undo/redo stack

## Parking Lot

The parking lot contains features we've talked about, discussed, and even put
time towards designing. The priority can shift of course, these are included
in order for us to be explicit about goals.

* Real time collaboration
* Remote kernels (binder, JupyterHub remote, or raw Docker launches)
* Metrics and instrumentation around usage of the notebook
