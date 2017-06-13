# nteract transforms for electron based frontends

These are transforms specifically tailored for electron based frontends, targeting:

* `application/javascript`
* `text/html`

## Installation

```
npm install @nteract/transforms-electron
```

## Usage

### Adding New Transforms

```js
import {
  richestMimetype,
  registerTransform,
  standardTransforms,
  standardDisplayOrder,
} from '@nteract/transforms'

import { HTMLTransform, JavaScriptTransform } from '@nteract/transforms-electron'

const transforms = standardTransforms
  .set(HTMLTransform.MIMETYPE, HTMLTransform)
  .set(JavaScriptTransform.MIMETYPE, JavaScriptTransform)

let Transform = transforms.get(mimetype);
```
