# ANSI to React

Convert ANSI Escape Codes to pretty text output for React.

## Installation

You may use whichever package manager (`npm` or `yarn`) best suits your workflow. The `nteract` team internally uses `yarn`.

```bash
npm install --save ansi-to-react
# OR
yarn add ansi-to-react
```

## Usage

```js
const Ansi = require('ansi-to-react');

...

<Ansi>
  {'\u001b[34mnode_modules\u001b[m\u001b[m'}
</Ansi>
```
