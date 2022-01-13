# YYYY/MM/DD nteract Release

## Changelog

## Applications

### nteract desktop app

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

- Now using "scrolled" metadata property instead of "collapsed" to denote whether a cell output is within a scrolled div or not, in order to align with standard [ipynb format](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json). "collapsed" metadata property is no longer being set for new cells (used to be set to true). ([#5538](https://github.com/nteract/nteract/pull/5538))
- Added support for `"scrolled": "auto"` for outputs (see "scrolled" property in [ipynb format schema](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json)), replicating behavior in classic Jupyter Notebook. When "auto" scroll mode is set for a cell (or when "scrolled" is not defined, as "auto" is the default), then a cell's output will have scroll enabled if and only if its output's height exceeds a certain tall threshold (currently 1800px). The scrolling can still be set manually by setting `"scrolled": true` or `"scrolled": false`, or in the nteract UI by using the "Extended Output" toggle.

#### New Features

- Upgraded electron v5.0.13 → v7.3.2 ([Changelog](https://github.com/electron/electron/releases)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))
- Upgraded electron-builder v22.1.0 → v22.7.0 ([Changelog](https://github.com/electron-userland/electron-builder/releases)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))
- Upgraded electron-context-menu v0.16.0 → v2.0.1 ([Changelog](https://github.com/sindresorhus/electron-context-menu/releases)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))
- Upgraded electron-log v4.0.0 → v4.2.1 ([Changelog](https://github.com/megahertz/electron-log/blob/master/CHANGELOG.md)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))
- Upgraded electron-updater v4.2.0 → v4.3.1 ([Changelog](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/CHANGELOG.md)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

- Fixed mythic-configuration, allowing it to be imported in a browser setting ([Issue #5445](https://github.com/nteract/nteract/issues/5445))
- Upgraded react-syntax-highlighter v^12.0.0 -> v^13.0.0 ([PR#5523](https://github.com/nteract/nteract/pull/5523))
- Fixed outputToJS, no reformatting text in serializing stream output ([#5596](https://github.com/nteract/nteract/pull/5596))

## Core SDK Packages

### @nteract/actions ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/commutable ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

- Monaco autocompletion should return suggestion content after the last dot - issue #5545 ([#5546](https://github.com/nteract/nteract/pull/5546))

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/connected-components ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

- Upgraded styled-components v4.4.1 → v5.0.1 ([Changelog](https://github.com/styled-components/styled-components/blob/master/CHANGELOG.md)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/core ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/editor ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/epics ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.
- Add support for multiple clients to be able to connect the same remote kernel. ([PR#5557](https://github.com/nteract/nteract/pull/5557))

#### Bug Fixes

- Update kernel execution state after receiving a `kernel_request_reply` message ([PR#5331](https://github.com/nteract/nteract/pull/5331))

### @nteract/fixtures ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @mybinder/host-cache ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/markdown ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/messaging ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/monaco-editor ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

- Add support to register custom commands using the command handler ([#5418](https://github.com/nteract/nteract/pull/5418))
- Add support to register custom editor formatting providers ([#5444](https://github.com/nteract/nteract/pull/5444))
- Add support to listen on editor created event ([#5444](https://github.com/nteract/nteract/pull/5444))

#### Bug Fixes

- Hide Monaco parameter widget when mouse moves into another editor cell ([#5301](https://github.com/nteract/nteract/pull/5301))
- Fix cursor position issue when invoking language cell magics in Monaco editor ([#5405](https://github.com/nteract/nteract/pull/5405))
- Fix issues with handling of kernel completions ([#5407](https://github.com/nteract/nteract/pull/5407))

### @nteract/mythic-configuration ([publish-version-here])

- New mythic package, will setup a transient in-memory configuration store, but different backends (such as using a configuration file) can be setup (see below). ([PR#5137](https://github.com/nteract/nteract/pull/5137))
- To use the package, either:
    * use the `makeConfigureStore` function from `@nteract/myths`:
        ```typescript
        import {configuration} from "@nteract/mythic-configuration";
        import {makeConfigureStore} from "@nteract/myths";
      
        type NonPrivateState = { foo: string };
        const configureStore = makeConfigureStore<NonPrivateState>()({
          packages: [
            configuration,
          ],
          // reducers, epics, etc.
        });
        export const store = configureStore({ foo: "bar" });
        ```
    * or call `configuration.rootReducer(state, action)` in your reducer and add the return value of `configuration.makeRootEpic()` to your epics.     
- Dispatch the return value of `setConfigFile(<path>)` to make it load/write/watch a config file instead.
- To define configuration options, use `defineConfigOption(...)`:
    ```typescript
    import {defineConfigOption} from "@nteract/mythic-configuration";
    
    export const {
      selector: tabSize,
      action: setTabSize,
    } = defineConfigOption({
      label: "Tab Size",
      key: "codeMirror.tabSize",
      values: [
        {label: "2 Spaces", value: 2},
        {label: "3 Spaces", value: 3},
        {label: "4 Spaces", value: 4},
      ],
      defaultValue: 4,
    });
    ```
- You can then use the selector (e.g. `tabSize` above) to get the value from a store (e.g. `tabSize(store.getState())`).
- You can then alter the state by dispatching the result of the action function (e.g. `setTabSize` above, `store.dispatch(setTabSize(4))`).
- If you have a group of config options with a common prefix (e.g. `codemirror.<...>`), you can get a selector for the whole group with `createConfigCollection(...)`:
    ```typescript
    import {createConfigCollection} from "@nteract/mythic-configuration";
    
    const codeMirrorConfig = createConfigCollection({
      key: "codeMirror",
    });
    ```
    You can then do something like `codeMirrorConfig(store.getState())` to get something like
    ```javascript
    {
      tabSize: 4,
      // ... other options starting with `codemirror.`, potentially nested if more than one dot 
    }
    ```
- The state is stored under `__private__.configuration` in the store, but it shouldn't be neccessary to directly access it.
- To type the state/store you can use `HasPrivateConfigurationState`.
- If you need a different way of persisting the config, you can set your own backend, e.g.:
    ```typescript
    // Since the cats are typically lazing about the computer, let's utilize them to store our
    // config...
    const catConfigurationBackend = (whichCats: Cat[]) => ({
      setup: () =>
        // Is called when the config system initialises, should return an Observable<Action>,
        // generally using the loadConfig myth to specify when the config should be loaded.
        concat(
          of("immediately"),
          interval(10 * 60 * 1000),
        ).pipe(
          tap(_ => wakeUpCats(whichCats)),
          mapTo(loadConfig.create()),
        ),
        
      load: () =>
        // Is called to load config, should return an Observable<Action>, generally using
        // the setConfig and/or setConfigAtKey myths to determine the config.
        askTheCatsAboutTheirConfigOptions(whichCats).pipe(
          mapErrorTo(undefined, error => error?.complaint === "HUNGRY"),
          skipWhile(data => data === undefined),
          map(setConfig.create),
        ),
    
      save: (current: Map<string, any>) =>
        // Is called with the current config object to save it after it changed, should return an
        // Observable<Action>, which should be empty unless you need to dispatch actions on save.
        tellTheCatsToRememberConfigOptions(current.toJSON(), whichCats).pipe(
          ignoreElements(),
        ),
    } as ConfigurationBackend);
    
    export const setConfigCats = (whichCats: Cat[]) =>
      setConfigBackend.create(catConfigurationBackend(whichCats));
    
    // Now just do store.dispatch(setConfigCats(...)) to start using it and hope the cats have good
    // memory and feel like cooperating...
    ```

### @nteract/mythic-notifications ([publish-version-here])

#### Internal Changes

- Adapted to changes in the `myths` API (no functional change). ([PR#5106](https://github.com/nteract/nteract/pull/5106))

### @nteract/myths ([publish-version-here])

#### Breaking Changes

- Changed API somewhat, see `README.md` for details. ([PR#5106](https://github.com/nteract/nteract/pull/5106))

#### New Features

- See `README.md` for details. ([PR#5106](https://github.com/nteract/nteract/pull/5106))

### @nteract/notebook-app-component ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

- Upgraded styled-components v4.4.1 → v5.0.1 ([Changelog](https://github.com/styled-components/styled-components/blob/master/CHANGELOG.md)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

-Inappropriate initial scroll on opening a notebook in firefox. Updating the index file of the notebook-app-component/src/decorators/hijack-scroll to use a pony fill function for scroll in old browsers. ([Issue#5576](https://github.com/nteract/nteract/issues/5576)) ([PR#5577](https://github.com/nteract/nteract/pull/5577/files))

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/presentational-components ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

- Upgraded styled-components v4.4.1 → v5.0.1 ([Changelog](https://github.com/styled-components/styled-components/blob/master/CHANGELOG.md)) ([PR#5115](https://github.com/nteract/nteract/pull/5115))

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/reducers ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### rx-binder ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### rx-jupyter ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

- Fixed session field in messages not being updated properly. ([PR#5115](https://github.com/nteract/nteract/pull/5115))

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/selectors ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/stateful-components ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/styles ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/transform-model-debug ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/types ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

### @nteract/web

#### New Features

- Move away from the local state to the global state

#### Bug Fixes

- File Explorer won't auto update the state now.

### @nteract/webpack-configurator ([publish-version-here])

#### Breaking Changes

Provide a bulleted list of breaking changes and a reference to the PR(s) containing those changes.

#### New Features

Provide a bulleted list of new features or improvements and a reference to the PR(s) containing these changes.

#### Bug Fixes

Provide a bulleted list of bug fixes and a reference to the PR(s) containing the changes.

## Acknowledgements

Provide a bulleted list of the GitHub handles of the contributors who have submitted PRs to the nteract repo for this release.
