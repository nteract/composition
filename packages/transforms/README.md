# nteract transforms

![transformime](https://cloud.githubusercontent.com/assets/6437976/8895696/db154a04-3397-11e5-91ca-296b957658a6.png)

It's likely you don't need to use this package directly and can instead use a
release of the display area (:soon:).

## Installation

```
npm install @nteract/transforms
```

Note: React and Immutable are peer dependencies you'll have to install yourself.

## Usage

### Standard Jupyter Transforms

```js
import {
  richestMimetype,
  standardTransforms,
} from '@nteract/transforms'

import Immutable from 'immutable'

// Jupyter style MIME bundle
const bundle = new Immutable.Map({
  'text/plain': 'This is great',
  'image/png': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
})

// Find out which mimetype is the richest
const mimetype = richestMimetype(bundle, standardTransforms)

// Get the matching React.Component for that mimetype
let Transform = standardTransforms.get(mimetype)

// Create a React element
return <Transform data={bundle.get(mimetype)} />
```

### Adding New Transforms

```js
import {
  richestMimetype,
  registerTransform,
  standardTransforms,
  standardDisplayOrder,
} from '@nteract/transforms'

import geoTransform from '@nteract/transform-geojson'

const {
  transforms,
  displayOrder,
} = registerTransform({
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder,
}, geoTransform)

...

let Transform = transforms.get(mimetype);
```
