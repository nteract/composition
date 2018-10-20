# `transform-widgets`

Rich media type which will render Jupyter-Widgets in isolated iframes.

`MIMETYPE = "application/vnd.jupyter.widget-view+json"`

## Usage

### Within nteract

```jsx
import { WidgetDisplay } from "@nteract/transform-widgets";

...

<WidgetDisplay data={{model_id: 'widget-model-guid'}}/>
```

### Outside of nteract

```jsx
import { PureWidgetDisplay } from "@nteract/transform-widgets";

...

<PureWidgetDisplay 
    data={{model_id: 'widget-model-guid'} 
    currentKernel={remoteKernelPropsInstance}}/>
```

See `RemoteKernelProps` of `nteract/packages/core/src/state/entities/kernels.js` 
for a description of `remoteKernelPropsInstance`.
