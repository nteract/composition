```jsx
var MathJax = require(".").default;

const tex = String.raw`f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi`;

<MathJax.Provider>
  <div>
    This is an inline math formula: <MathJax.Node inline formula={"a = b"} />
    and a block one:
    <MathJax.Node formula={tex} />
  </div>
</MathJax.Provider>;
```
