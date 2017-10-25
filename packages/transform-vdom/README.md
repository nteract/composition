# Transform VDOM

React Component for transforming `application/vdom.v1+json` data to React
Elements.

## Installation

```
npm install --save @nteract/transform-vdom
```

Note: This transform is included in `@nteract/transforms` so if you're using that
you don't have to add this to your mimetype transforms.

## Usage

```js
import VDOMTransform from '@nteract/transform-vdom'

ReactDOM.render(
  <VDOMTransform
    // Data from display_data or execute_result mimebundle on the
    // mimetype key application/vdom.v1+json
    data={{ tagName: 'h1', children: 'Hey', attributes: {}}}
  >,
  rootEl)
```

Users of this mimetype are likely using a higher level library that lets
them write declaratively in their language of choice. For Python, there's
[`vdom`](https://github.com/nteract/vdom) which lets you write code like:

```python
from IPython.display import display
from vdom.helpers import h1, p, img, div, b

display(
    div(
        h1('Our Incredibly Declarative Example'),
        p('Can you believe we wrote this ', b('in Python'), '?'),
        img(src="https://media.giphy.com/media/xUPGcguWZHRC2HyBRS/giphy.gif"),
        p('What will ', b('you'), ' create next?'),
    )
)
```
