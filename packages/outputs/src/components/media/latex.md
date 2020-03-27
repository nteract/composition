LaTeX formula are returned from the kernel using the `text/latex` media type. `@nteract/mathjax` is used to typeset the mathematics.

```
const data = String.raw`The well known Pythagorean theorem \(x^2 + y^2 = z^2\) was
proved to be invalid for other exponents.
Meaning the next equation has no integer solutions:

\[ x^n + y^n = z^n \]`;

<LaTeX data={data} />
```
