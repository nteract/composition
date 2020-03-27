Markdown is a popular markup language for formatting text files. The `Media.Markdown` component allows you to render Markdown. The default media type used for the `Media.Markdown` component, and elsewhere on the web, is `text/markdown`. To render markdown, you'll need to pass the plain-text markup of your Markdown text to the `data` prop of the component like so.

```
<Markdown data={"Markdown is **Awesome!!!**"} />
```

This component renders Markdown that complies with the [Commonmark Markdown specification](https://commonmark.org/), so you can use it to render a variety of block and inline formats.

```
<Markdown data={"```a code block```"}/>
```
```
<Markdown data={`> a block quote`}/>
```

The `Media.Markdown` component also renders HTML. This ability does expose certain security issues so be sure that whatever content you are planning on rendering with your `Media.Markdown` component originates from a trusted source.

```
<Markdown data={`<strong><em>You</em> &amp; I</strong>`}/>
```

In addition to HTML, `Media.Markdown` also allows you to render LaTeX equations within your Markdown as follows.

```
<Markdown data={`Math, like $C_{d}^{\prime} = \\frac{\alpha}{}$, is pretty cool.`}/>
```