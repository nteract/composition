The MathJax component provides a way to both load MathJax on the page and render MathJax Nodes. Many people love ❤️ beautifully typeset mathematics, and these components are the way to provide it.

```jsx
const { Provider, Node } = require("@nteract/mathjax");

const tex = String.raw`f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi`;

<Provider>
  <p>
    This is an inline math formula: <Node inline>a = b</Node>
    <span> and a block one:</span>
    <Node>{tex}</Node>
  </p>
</Provider>;
```

The components are written in a React 16+ way to both load mathjax through a `<Provider />` and render individual MathJax nodes with `<Node />`. React does the heavy lifting of knowing what changed and the `<Node>` component triggers having MathJax do what it's good at — _typesetting mathematics_!

This semi-contrived example shows

```jsx
const { Provider, Node } = require("@nteract/mathjax");

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
      <Provider options={{ messageStyle: "none" }}>
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
          <Node inline>{"n^" + this.state.exponent}</Node> pieces of a paragraph
          without triggering a MathJax re-render.
        </p>
      </Provider>
    );
  }
}

<CleanUpdates />;
```

If you use `<Node />` with no provider, a `<Provider />` is created for you automatically.

```jsx
const { Node } = require("@nteract/mathjax");

<Node>a = b</Node>;
```
