# A Guide to nteract Transforms

In the overview, we covered the `display_data` response type from kernels. When the user executes code that returns a rich display, such as an image or data visualization, this response is returned. Each `display_data` has multiple representations associated with it.

```json
{
  "content": {
    "data": {
      "text/html": "<img src=\"https://avatars2.githubusercontent.com/u/12401040?v=3&s=200\"/>",
      "text/plain": "<IPython.core.display.Image object>"
    },
    "metadata": {},
    "transient": {}
  }
}
```

How do we transform these strings of text to visual elements on the page? With transforms!

Transforms are React components that take a the data of a `display_data` view and display a DOM element on the page. There is a unique transform for each different media type. In the example above, the `text/html` media type is associated with the HTML transform and the `text/plain` media type is associated with the plain-text transform. Each transform understands how to interpret the contents of the data payload and render them on the page.

## Display Order

The `display_data` output above contains two representations associated with two different media types. Given the two options we have, we want to render the richest representation available in the UI. So, if our UI is web-based, we would like to render the HTML representation. On the other hand, if our UI is console-based, we will have to render the plain-text representation.

nteract will always try to render the richest media type available on the nteract-based UI. Available transforms are registered in the `transforms` property of the nteract state.

```json
import { Media } from "@nterac/toutputs";

{
    transforms: {
        byId: {
            "text/html": Media.HTML,
            "text/plain": Media.Plain
        },
        displayOrder: [
            "text/html",
            "text/plain"
        ]
    }
}
```

What if you always wanted to display `text/plain` outputs in your UI? You can move the `text/plain` media-type to the top of the `displayOrder` list.

## Creating custom transforms

In the example above, we covered a simple transform that rendered HTML or plain-text. But the possibilities are infinite. Jupyter kernels can return a wide array of display objects. nteract provides transforms for a few of these object by default.

| Media Type                       | nteract Transform                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `application/geo+json`           | [transform-geojson](https://github.com/nteract/nteract/tree/master/packages/transform-geojson) |
| `application/vnd.plotly.v1+json` | [transform-plotly](https://github.com/nteract/nteract/blob/master/packages/transform-plotly)   |
| `application/vdom.v1+json`       | [transform-vdom](https://github.com/nteract/nteract/tree/master/packages/transform-vdom)       |
| `application/vnd.vega.v2+json`   | [transform-vega](https://github.com/nteract/nteract/blob/master/packages/transform-vega)       |

Transforms are React components that can take a `display_data` object and return a view given the data associated with a specific media type.

`display_data` objects are returned from the code executions that return Jupyter display objects.

You can create custom Jupyter display objects from the executed code and you can write a custom nteract transform using React. It stands to reason that you can build an entire custom output for any snippet of code. We'll learn all about creating custom transforms in the next section.
