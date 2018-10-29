# TypeScript Conversion

We are in the process of converting from flow types to TypeScript. Here are the
basic things you need to know about how to help with the conversion and how
things will work in the future once it is complete.

## Workflow Changes

As we move packages over to TypeScript, our workflow will change in the
following ways.

### 1. No more per-project builds

TypeScript packages are built in a single pass using the built-in project build
system provided by `tsc`, which is much faster and easier to maintain. This
means that instead of building packages one by one, you generally will just want
to build all packages from the root directory.

The main commands, `build`, `clean`, and `build:watch` all have
equivalent scripts prefixed with `tsc:` which activates only the TypeScript
system. You can limit the scope of any one of these commands by adding a
path to a package:

    yarn tsc:build packages/core  # builds just core and its dependencies

Presently if you run a general command like `yarn build`, it will first invoke
the top-level `tsc` version of the command and then runs the equivalent command
– if it exists – in each package or application.

### 2. tsc files are built sepatately

The rest of our tools (webpack, IDE integrations) basically expect to see
up-to-date built tsc files at all times, so if you are editing a tsc-enabled
package and not seeing any changes reflected in other packages, make sure you
have `tsc:watch` running. The standard app dev tasks all start a tsc watch
process automatically.

---

## Conversion Notes

Want to help convert to TypeScript? Great! Here is how you can help:

### Pick a package to convert

Checkout the [status board](https://github.com/orgs/nteract/projects/13) and
[tracking issue](https://github.com/nteract/nteract/issues/3462) to find out
which packages to convert. Work your way up the dependency graph inside
packages/, attempt to tighten strictness as we go.

TODO: Link to Status Board

### Add a tsconfig.json

You can usually just start by copying the one in the `ansi-to-react` package.

Generally you will not need to modify the tsconfig settings here except if
your package references another package in the local repo you need to add
that package as an explicit reference. For example, if your package depended
on the `@nteract/messaging` package you should add:

```json
{
  // other settings
  "include": ["src"],
  "references": [
    { "paths": "../messaging" }
    // paths to other local package dependencies here
  ]
}
```

### Update the package.json

Update the keys thus:

```json
{
  // update these keys, add them if they are missing
  "main": "lib/index.js",
  "types": "lib/index.d.ts",

  // update this key if present, otherwise omit
  "nteractDesktop": "src/index.ts",

  // delete any of the scripts listed below. If there are no other scripts
  // present, delete the entire key
  "scripts": {
    "prepare": "...",
    "prepublishOnly": "...",
    "build": "...",
    "build:clean": "...",
    "build:flow": "...",
    "build:lib": "...",
    "build:lib:watch": "...",
    "build:watch": "..."
  },

  // delete any package dependencies not explicitly imported by the package
  // code. (Unless there is some specific reason to keep it). In general, if
  // you see any babel-related dependencies you can delete them
  "dependencies": {
    "@babel/runtime-corejs2": "^7.0.0", // OK to delete
    "babel-runtime": "^6.26.0", // OK to delete
    "rxjs": "^6.3.3" // only keep if imported in code
    //...
  },

  "devDependencies": {
    // ditto
  }
}
```

### Rename all file extensions

It's best to rename the files in a manor that can be tracked by git. I.e. use
`git mv` or rename in vscode with git integration turned on. This will make
the final pull request much easier to review.

All files both in the `src` and in the test directories should be renamed to a
`.ts` extension unless they include JSX, in which case rename to `.tsx`.

### Add flow index file

Create a new file at `src/index.js.flow`. As you convert files, you will also
want to fill in this file with the old flow types so that unconverted packages
can continue to use the package.

> NOTE: if you search the source and determine that no other code depends on
> your package, or all dependent packages are already converted to TypeScript,
> then you can omit this file. An easy way to check for dependents is to use
> `yarn why @nteract/your-package-name`.

### Convert the files

Exercise left to reader. Be sure to convert both the source files and tests.

Here are some tips:

- Import all monorepo types from our root level types/ directory.

- Establish as-strict-as-possible compiler options, if an imported package needs
  to be any because it is currently not typed by us, dont worry if you have to
  allow an implicit any while you're migrating.

- Try to minimize urges to introduce breaking changes into the code.

- Leverage types from imported code as often as possible

- When all package work is done, type applications/and other third-party tools
  using nteract packages.

- If you need to install @types for a dependent packages, add them as development
  dependencies to the package itself, not the top level.

- Add some docs! vscode has very good integration with code docs.

- See following section for some notes on building your `index.js.flow` file.

- If you're converting a package that relies on other local packages not yet
  converted, add an `index.d.ts` to the root of the dependent package and fill
  in any necessary type stubs there. This is just intended as a stopgap until
  the packages are all converted.

### Testing your changes

Usually make sure all of the following work before you submit your PR.
All commands run from top-level:

    yarn ts:build:clean

Make sure a `lib` folder is added to your package that includes `.js` and
`.d.ts` for all of your files. If this does not happen and there are no errors
make sure have added your package to the top-level `tsconfig`.

    yarn test

All tests should pass. Also make sure that you see your tests have actually
run.

    yarn test:flow

This will surface any issues with other packages that were relying on types
from your package. Usually you'll end up hacking on your `index.js.flow` file.

One complication you might run into is that sometimes other packages import
specific files inside your package. This is problematic when using TypeScript
because we build the files to a separate location. It's generally best to
convert all of these call sites so that they simply import the default for the
package and you include all of the relevant exports there.

Note that because of tree shaking, if you simply rexport imports from other
files through your master, it will generally not have a negative impact on
performance or file size.

If you do make changes to your flow file such as the above factoring, besure
that your actual TypeScript exports exactly match.

### Submit a PR

Once you have all your tests passing, submit your PR!

---

## Improvement Goals / Issues
