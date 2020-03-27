# Creating custom transforms

To create our custom transform, we will first start off by generating a data schema for our transform. This schema will consist of the media type that we want associated with our custom transform and the required data. Let's create a custom image transform that will take a URL render the image inline. We'll use the `application/custom+image` media type for our transform. We expect our transform to return the following data.

```
"application/custom+image": {
    url: "some_url_string
}
```

To return this custom display object, we'll write some Python code to return it. Note that this code can live in a user's notebook or inside an SDK.

```python
from IPython import display
def display_image(url):
    display(
        {
            'application/custom+image': {
                'url': url
            }
        },
        raw=True
    )
```

Now, whenever we invoke `display_image` with a URL...

```python
display_image("https://google.com")
```

...our custom display object will be returned.

```json
{
  "header": {
    "msg_id": "dee8b762-55ff3974d3ec058673943272",
    "msg_type": "display_data",
    "username": "jovyan",
    "session": "ab5f4df2-170dc205efb0162216b06b93",
    "date": "2020-01-20T18:39:17.094143Z",
    "version": "5.3"
  },
  "msg_id": "dee8b762-55ff3974d3ec058673943272",
  "msg_type": "display_data",
  "parent_header": {
    "msg_id": "a701150300c047fb884c0532cec803b5",
    "username": "username",
    "session": "64a0b46ccde943fd8c3928a604e76dbc",
    "msg_type": "execute_request",
    "version": "5.2",
    "date": "2020-01-20T18:39:17.091372Z"
  },
  "metadata": {},
  "content": {
    "data": { "application/custom+image": { "url": "https://google.com" } },
    "metadata": {},
    "transient": {}
  },
  "buffers": [],
  "channel": "iopub"
}
```

Next, we will need to create a nteract transform that renders our component. An nteract transform is a React component that adheres to the following schema.

```js
import React from "react";

interface CustomImageObject {
    url: string;
}

interface Props {
    mediaType: "application/custom+image",
    data: CustomImageObject;
}

export default class CustomImageTransform extends React.Component<Props> {
    static defaultProps {
        mediaType: "application/custom+image",
    }

    render() {
        const { data } = this.props;
        return <img src={data.url}/>;
    }
}
```

A nteract transform **must** define a `mediaType` prop that stores the media type the transform is related to. In this case, it's `application/custom+image`. The transform must also take a `data` prop which takes the value of the media type in the return `display_data` object. In this case, it is an object with a `url` property that holds a string representation of the URL.

The transforms `render` method is where the magic happens. Here, we take the data from the props of the component and use the `url` field to render an image. The logic inside the `render` method is media-type specific so get creative and implement whatever render logic you want based on the contents of the transform.

Once a transform is created, we will need to register it to the transform state in nteract. This can be done by dispatch an `addTransform`.

```js
import { actions } from "@nteract/core";
import { dispatch } from "redux;

import CustomImageTransform from "./custom-image";

dispatch(
    actions.addTransform({
        mediaType: "application/custom+image",
        component: CustomImageTransform
    })
)
```

You can also register the transform in the initial state of your nteract-based UI.

```json
{
  "transforms": {
    "byId": {
      "application/custom+image": CustomImageTransform
    },
    "displayOrder": ["application/custom+image"]
  }
}
```

And voila! Now when we execute our `display_image` function, we will see the image in the provided URL in our cell's output.
