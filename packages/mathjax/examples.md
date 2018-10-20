The MathJax component provides a way to both load MathJax on the page and render MathJax Nodes. Many people love ❤️ beautifully typeset mathematics, and these components are the way to provide it.

```jsx
var MathJax = require(".");

const tex = String.raw`f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi`;

<MathJax.Provider>
  <p>
    This is an inline math formula: <MathJax.Node inline>a = b</MathJax.Node>
    <span> and a block one:</span>
    <MathJax.Node>{tex}</MathJax.Node>
  </p>
</MathJax.Provider>;
```

The components are written in a React 16+ way to both load mathjax through a `<Provider />` and render individual MathJax nodes with `<MathJax.Node />`. React does the heavy lifting of knowing what changed and the `<MathJax.Node>` component triggers having MathJax do what it's good at — _typesetting mathematics_!

This semi-contrived example shows

```jsx
var MathJax = require(".");

const verbs = ["do", "can", "should", "will"];

class CleanUpdates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exponent: 1,
      verb: "can"
    };
  }

  componentDidMount() {
    this.intervals = [
      setInterval(() => {
        this.setState(state => ({
          exponent: (state.exponent + 1) % 10
        }));
      }, 3001), // Prime

      setInterval(() => {
        this.setState(state => ({
          verb: verbs[Math.floor(Math.random() * verbs.length)]
        }));
      }, 557) // Also prime
    ];
  }

  componentWillUnmount() {
    this.intervals.map(id => clearInterval(id));
  }

  render() {
    return (
      <MathJax.Provider options={{ messageStyle: "none" }}>
        <p>
          We{" "}
          <span
            style={{
              backgroundColor: "#7ee77e",
              padding: "5px",
              margin: "5px",
              width: "42px",
              display: "inline-block",
              textAlign: "center"
            }}
          >
            {this.state.verb}
          </span>{" "}
          update
          <MathJax.Node inline>{"n^" + this.state.exponent}</MathJax.Node> pieces
          of a paragraph without triggering a MathJax re-render.
        </p>
      </MathJax.Provider>
    );
  }
}

<CleanUpdates />;
```

If you use `<MathJax.Node />` with no provider, a `<MathJax.Provider />` is created for you automatically.

```jsx
var MathJax = require(".");

<MathJax.Node>a = b</MathJax.Node>;
```
