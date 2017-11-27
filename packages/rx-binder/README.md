# rx-binder

Observables for Binders.

## Usage

```js
const { binder } = require("rx-binder");

binder({ repo: "nteract/vdom" }).subscribe(msg => console.log(msg));
```

Output:

```
{ phase: 'built',
  imageName: 'gcr.io/binder-prod/prod-v4-1-nteract-vdom:78fa2b549f67afc3525543b0bccfb08a9e06b006',
  message: 'Found built image, launching...\n' }
{ phase: 'launching', message: 'Launching server...\n' }
{ phase: 'ready',
  message: 'server running at https://hub.mybinder.org/user/nteract-vdom-r115e00y/\n',
  url: 'https://hub.mybinder.org/user/nteract-vdom-r115e00y/',
  token: 'tocwpFakeToken' }
```
