## nteract v0.11.7 - Blacksmith Blackwell

* No more pesky kernel shutdown error when no kernel available
* Upgrade to babel 7 and next.js 7
* Migrate examples to 🆕 [examples](https://github.com/nteract/examples) repo
* nteract on jupyter now respects `_xsrf` token
* `<RichMedia />` component
* nteract on jupyter now supports Python < 3.6

## nteract v0.11.6 - Birken Birkeland

Main change: LaTeX is back to working and not breaking your entire app 🔣🔥😱😅

See https://github.com/nteract/nteract/pull/3228 for details.

## nteract v0.11.3 - Birdy Birdseye

* More help text for Data Explorer
* Palette chooser
* Less bugs in data explorer! Click More Things™!

## nteract v0.11.2 - Binary Binet

📊 Data Explorer now has contour plots and heatmaps!

Datetime is now supported in the data explorer.

![contour plots](https://user-images.githubusercontent.com/495634/43361395-7dfacf2c-9282-11e8-8ebd-2fbb75419cf1.gif)

![time series plots](https://user-images.githubusercontent.com/495634/43349170-dba33d88-91b2-11e8-9e4d-42d02e19369c.png)

## nteract v0.10.0 - Basic Bhabha

* _Really_ fixed AppImage build for Linux
* Unified directory listing component for commuter and jupyter extension
* Brand new `@mybinder` components and libraries for caching Binder hosts
* Tray icon for launching notebooks!

## nteract v0.9.1 - Bewildered Bethe

* Fixed AppImage build for Linux
* Corrected rendering of subsequent `text/plain` `display_data` and `execute_result` outputs
* Improved performance during app usage by using Immutable objects for outputs again, making sure to allow Hydrogen's non-immutable version

## nteract v0.9.0 - Bespectacled Bessemer

🤓🔩

### Data Explorer

nteract desktop can now do the automatic dataviz that previously was only released on the jupyter extension.

<!--

Talk about old and new data explorer features

* Parallel coordinates
* Hexbin

-->

### Component documentation

We're in the beginnings of documenting our components using [react-styleguidist](https://react-styleguidist.js.org/). You can see a sneak preview at [components.nteract.io](https://components.nteract.io).

### Jupyter Extension

Jupyter Extension has some exciting new additions including near menu parity with nteract desktop 🎉

- 📝 We now have a Monaco editor component

- "Open..." has been added to the menu and will redirect the user to the directory listing 

- Notebook cards have been scaled down and padding added to the bottom of the directory listing for easier viewing on smaller screens 

### Gist publishing

Gist publishing is much more stable now! :octocat: _However_, GitHub no longer allows new anonymous gists. 😢 All gists published from nteract must use authentication. 🔐

### Open Recent Menu

Now that we're on Electron 2.x, we can support an "Open Recent" menu. Right now it is only supported on macOS.

### Mega Vega

We support vega 2, vega 3, vega-lite 1, and vega-lite 2!

- 🐍 In Python use [Altair](https://altair-viz.github.io/)

- 🌶 In Scala use [Vegas](https://github.com/vegas-viz/Vegas)

![vega](https://user-images.githubusercontent.com/836375/41311196-6d849a2e-6e38-11e8-9d30-21553301beb2.gif)

## Miscellaneous

- Improved kernel clean up
- Better font sizes in drop down menu
- Upgraded to webpack 4\*
