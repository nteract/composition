# nteract transforms

This contains all the transforms that nteract uses, which extends all those
supported by Jupyter frontends from `@nteract/transforms` while adding on

* GeoJSON
* Plotly
* Vega

![transformime](https://cloud.githubusercontent.com/assets/6437976/8895696/db154a04-3397-11e5-91ca-296b957658a6.png)

It's likely you don't need to use this package directly and can instead use a
release of the display area (:soon:).

## Installation

```
npm install @nteract/transforms-full
```

Note: React is a peer dependencies you'll have to install yourself.

## Usage

### Standard nteract Transforms

```js
import {
  richestMimetype,
  transforms,
  displayOrder,
} from '@nteract/transforms-full'

// Jupyter style MIME bundle
const bundle = {
  'text/plain': 'This is great',
  'image/png': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
}

// Find out which mimetype is the richest
const mimetype = richestMimetype(bundle, transforms)

// Get the matching React.Component for that mimetype
let Transform = transforms[mimetype]

// Create a React element
return <Transform data={bundle[mimetype]} />
```

### Adding New Transforms

```js
import {
  richestMimetype,
  registerTransform,
  transforms,
  displayOrder,
} from '@nteract/transforms-full'

import someCustomTransform from 'somewhere';

let registry = { transforms, displayOrder };

registry = registerTransform(registry, someCustomTransform);

...

const Transform = registry.transforms[mimetype];
```
