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
