nteract is an [Electron app](https://github.com/atom/electron) that runs on your
desktop, which means that some code is intended to run in a main thread (native macOS menus, etc.)
while the rest goes in rendering threads (browser).

> In Electron, GUI-related modules (such as dialog, menu etc.) are only available in the main process, not in the renderer process.

Here in `src/`, there are two primary components:

* `main/` - the main thread and boot up code for all notebook windows
* `notebook/` - all the UI goodness of the notebook, intended for a single window
