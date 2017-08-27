/* @flow */
import React from "react";

import { objectToReactElement } from "./object-to-react";

type Props = {
  data: Object
};

export default class VDOM extends React.Component {
  props: Props;
  static MIMETYPE = "application/vdom.v1+json";

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  render(): ?React.Element<any> {
    try {
      return objectToReactElement(this.props.data);
    } catch (err) {
      return (
        <div>
          <pre>
            There was an error rendering VDOM data from the kernel or notebook
          </pre>
          <code>
            {JSON.stringify(err, null, 2)}
          </code>
        </div>
      );
    }
  }
}
