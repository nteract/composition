SVG, or Scalable Vector Graphics, is an image format for two-dimensional graphics that support interactions and animations. SVGs are often represented as an XML-based format, similar to the format below.

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
<circle cx="250" cy="250" r="210" fill="#fff" stroke="#000" stroke-width="8"/>
</svg>
```

That's right! Under the hood, SVG images are just plain-text. Their scalability and responsiveness makes them great for rendering charts and graphs. The media type used to refer to SVGs in the Jupyter ecosystem, and elsewhere on the web, is `image/svg+xml`. To render SVGs, you can use the `Media.SVG` component. You'll need to pass a `data` prop that contains the plain-text contents of the SVG.

```jsx
<SVG
  data={`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
<circle cx="250" cy="250" r="210" fill="#fff" stroke="#000" stroke-width="8"/>
</svg>`}
/>
```
