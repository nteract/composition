# @nteract/outputs

This package contains components for rendering different responses from a Jupyter kernel. These components provide support for rendering plain data and rich media (such as images and HTML) data.

## Installation

```
$ yarn add @nteract/outputs
```

```
$ npm install --save @nteract/outputs
```

## Usage

The example below shows how we can use the `ExecuteResult` component within this package to render the response to an execution request sent by our Jupyter kernel.

```javascript
import { ExecuteResult } from "@nteract/outputs";

export default () => {
  const Plain = props => <pre>{props.data}</pre>;
  Plain.defaultProps = {
    mediaType: "text/plain"
  };

  return (
    <ExecuteResult data={{ "text/plain": "The answer to everything is 42." }}>
      <Plain />
    </ExecuteResult>
  );
};
```

## Documentation

You can view the reference documentation for `@nteract/outputs` in the [component docs](https://components.nteract.io/#nteractoutputs).

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:outputs` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
