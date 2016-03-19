# ANSI to React

Convert ANSI Escape Codes to pretty text output for React.

```
npm install --save ansi-to-react
```

## Usage

```js
const Ansi = require('ansi-to-react');

...

<Ansi>
  {'\u001b[34mnode_modules\u001b[m\u001b[m'}
</Ansi>
```
