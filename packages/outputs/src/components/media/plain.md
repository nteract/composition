Plain text is....plain. It contains no formatting, images, or interactivity. Its lack of richness doesn't mean there isn't a component for it in the nteract space! You can use the `Media.Plain` component to render plain text. All you'll need to do is pass the contents of the text to the `data` prop of the component.

```jsx
const { Plain } = require("./plain");
<Plain data={"This text is as plain as can be."} />;
```

As it tuns out, although plain text does not contain any formatting. The `Media.Plain` component will let you format your content using [ANSI escape codes]((https://en.wikipedia.org/wiki/ANSI_escape_code). Here's an example of a piece of text formatted using the escape code for a red color.

```jsx
const { Plain } = require("./plain");
<Plain data={"\u001b[31msome red text\u001b[0m"} />;
```
