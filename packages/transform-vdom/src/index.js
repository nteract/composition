/* @flow */
import React from "react";

import { objectToReactElement } from "./object-to-react";
import { cloneDeep } from "lodash";

type Props = {
  data: Object
};

export default class VDOM extends React.Component<Props> {
  static MIMETYPE = "application/vdom.v1+json";

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  render(): React$Element<any> {
    try {
      // objectToReactElement is mutatitve so we'll clone our object
      var obj = cloneDeep(this.props.data);
      return objectToReactElement(obj);
    } catch (err) {
      return (
        <div>
          <pre>
            There was an error rendering VDOM data from the kernel or notebook
          </pre>
          <code>{JSON.stringify(err, null, 2)}</code>
        </div>
      );
    }
  }
}
