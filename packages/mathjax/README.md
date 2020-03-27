# @nteract/actions

This package contains two main components, `<MathJax.Context>` and `<MathJax.Node>`. The `<MathJax.Context>` component loads MathJax and makes it available to children elements via the React Context API. `<MathJax.Node>` takes raw text for rendering and uses MathJax to render formatted math.

## Installation

```
$ yarn add @nteract/mathjax
```

```
$ npm install --save @nteract/mathjax
```

## Usage

The Redux reducer below shows how we can leverage the actions and action types in this package to create a reducer for managing the status of a save event.

```javascript
import MathJax from "@nteract/mathjax";

export default text => {
  return (
    <MathJax.Context>
      <MathJax.Node>{`x^2 + y^2 = z^2`}</MathJax.Node>
      <MathJax.Node>{text}</MathJax.Node>
    </MathJax.Context>
  );
};
```

## Documentation

You can view the reference documentation for `@nteract/mathjax` in the [component docs](https://components.nteract.io/#nteractmathjax).

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:mathjax` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
