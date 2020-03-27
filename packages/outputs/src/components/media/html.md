HTML, or HyperText Markup Language, is markup language used for create web pages and web apps. The `Media.HTML` component allows you to render raw HTML in your nteract contexts. To use the component, you'll need to the pass the HTML that you would like to render in string form to the `data` prop, like so.

```
<HTML data={"<b>This is some <em>HTML</em> code.</b>"} />
```

Under the hood, this component renders your HTML string as if it originated from the rendered context. This is accomplished by creating a [Range object](https://developer.mozilla.org/en-US/docs/Web/API/Range), which represents an arbitrary part of the contents of an HTML document. For example, Range objects are used to represent the portion of an HTML document that a user has selected with their cursor. In this case, the Range is used as the context for a [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment), which acts as a pseudo-DOM node that contains the contents of the HTML string passed by the user.
