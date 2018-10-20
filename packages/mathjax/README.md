# MathJax React components for nteract usage

There are two main components to work with, `<MathJax.Context>` and
`<MathJax.Node>`. The `<MathJax.Context>` component loads MathJax and makes it
available to children elements via the React context API. `<MathJax.Node>` takes
raw text for rendering and has MathJax do the heavy lifting.

```js
import MathJax from "@nteract/mathjax";

const PrettyMath = text => {
  return (
    <MathJax.Context>
      <MathJax.Node>{`x^2 + y^2 = z^2`}</MathJax.Node>
      <MathJax.Node>{text}</MathJax.Node>
    </MathJax.Context>
  );
};
```
