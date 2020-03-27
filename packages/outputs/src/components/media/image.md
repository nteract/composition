When images are returned from a kernel, they come back as base64 encoded images as `image/png`, `image/gif`, or `image/jpeg`. One super common example of this is a chart from matplotlib.

```
const { matplotlibImage } = require("../../../sampleData/sampleImage");

<Image data={matplotlibImage} mediaType="image/png" />
```

The size of the image can be controlled by setting height and width in metadata. Python users typically do this with [`IPython.display.Image`](https://ipython.readthedocs.io/en/stable/api/generated/IPython.display.html?highlight=display#IPython.display.Image) or by directly integrating with [IPython's rich display handlers](https://ipython.readthedocs.io/en/stable/config/integrating.html?highlight=display#rich-display).

For example if a user displayed an image like this, we'd expect this output:

```python
IPython.display.Image(data, height="132px", width="193px")
```

```
const { matplotlibImage } = require("../../../sampleData/sampleImage");

<Image data={matplotlibImage} mediaType="image/png" metadata={{ height: "132px", width: "193px" }} />
```
