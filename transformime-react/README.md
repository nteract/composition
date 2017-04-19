# transformime-react

[![Build Status](https://travis-ci.org/nteract/transformime-react.svg)](https://travis-ci.org/nteract/transformime-react)

Transforms MIMEtype+data to pure React Elements.

![Optimus MIME](https://cloud.githubusercontent.com/assets/6437976/8895696/db154a04-3397-11e5-91ca-296b957658a6.png)

## Installation

```
npm install transformime-react
```

Note that `react` and `immutable` are peer dependencies; you'll need to install those as well if they're not in your project (hint: they're definitely needed to make this package useful at all).

```
npm install immutable@3.7.x react@0.14.x
```

## Usage

```es6
import { richestMimetype, transforms } from 'transformime-react';
import Immutable from 'immutable';

// Jupyter style MIME bundle
const bundle = new Immutable.Map({
  'text/plain': 'This is great',
  'image/png': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
});

// Find out which mimetype is the richest
const mimetype = richestMimetype(bundle); 

// Get the matching React.Component for that mimetype
let Transform = transforms.get(mimetype);

// Create a React element
return <Transform data={bundle.get(mimetype)} />;
```

which will return:

```jsx
<img src='data:image/png;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' />
```

as a React element. It chose 'image/png' as richer than 'text/plain' for representation.

### Override the default transforms and display order

```es6
const myOrder = Immutable.List(['text/plain', 'image/png']);

const CodeAsText = React.createClass({
  render: function() {
    return (
      <code>{this.props.data}</code>
    );
  }
});

const myTransforms = transforms.set('text/plain', CodeAsText);

const mimetype = richestMimetype(bundle, myOrder, myTransforms); 
Transform = myTransforms.get(mimetype);

return <Transform data={bundle.get(mimetype)} />;
```

Using the bundle from above, we'll get back:

```jsx
<code>This is great</code>
```

