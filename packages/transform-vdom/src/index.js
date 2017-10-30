/* @flow */
import React from "react";

import { objectToReactElement } from "./object-to-react";
import { cloneDeep } from "lodash";

type Props = {
  data: Object,
  metadata: Object,
  models: any
};

// Provide object-to-react as an available helper on the library
export { objectToReactElement };

export default class VDOM extends React.Component<Props> {
  static MIMETYPE = "application/vdom.v1+json";

  shouldComponentUpdate(nextProps: Props): boolean {
    return (
      nextProps.data !== this.props.data ||
      nextProps.models !== this.props.models
    );
  }

  render(): React$Element<any> {
    // Later, make this transient
    let model;
    if (
      this.props.metadata &&
      typeof this.props.metadata.modelID === "string" &&
      Object.keys(this.props.models).length > 0
    ) {
      const modelID = this.props.metadata.modelID;
      model = this.props.models[modelID];
    }

    try {
      // objectToReactElement is mutatitve so we'll clone our object
      var obj = cloneDeep(this.props.data);
      return objectToReactElement(obj, model);
    } catch (err) {
      return (
        <div>
          <pre
            style={{
              backgroundColor: "ghostwhite",
              color: "black",
              fontWeight: "600",
              display: "block",
              padding: "10px",
              marginBottom: "20px"
            }}
          >
            There was an error rendering VDOM data from the kernel or notebook
          </pre>
          <code>{err.toString()}</code>
        </div>
      );
    }
  }
}
