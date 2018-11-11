The `MarkdownRender` component allows you to render Markdown text per the Commonmark specification. It's got one major power-up though, it allows you to render in-line and block math using LaTeX syntax too.

Under the hood, the component builds upon the open-source [ReactMarkdown](https://github.com/rexxars/react-markdown) component. The `MarkdownRender` component takes all the same props and passes them on to the `ReactMarkdown` component it uses under the hood.

If you'd like to learn more about what props you can change, you can read [the documentation](https://github.com/rexxars/react-markdown#options) available on the ReactMarkdown component.

So, when would you want to use nteract's `MarkdownRender` component? Quite simply, whenever you need to render Markdown with some math in it. As long as your math is written in valid LaTeX, you can expect to see beautifully rendered math in your user interface.

To render Markdown using this component, you can pass the Markdown text to the `source` prop like so.

```
const MarkdownRender = require("@nteract/markdown").default;

<MarkdownRender source={`Just some $\delta_{\alpha}$ math.`}/>
```

Alternatively, you can pass the source as a child of the `MarkdownRender` component.

```
const MarkdownRender = require("@nteract/markdown").default;

<MarkdownRender>Some _sweet_, **sweet** Markdown.</MarkdownRender>
```