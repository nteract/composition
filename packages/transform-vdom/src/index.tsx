import * as React from "react";
import { cloneDeep } from "lodash";

import { objectToReactElement, VDOMEl } from "./object-to-react";

interface Props {
  mediaType: "application/vdom.v1+json";
  data: VDOMEl;
};

// Provide object-to-react as an available helper on the library
export { objectToReactElement };

const mediaType = "application/vdom.v1+json";

export default class VDOM extends React.Component<Props> {
  static MIMETYPE = mediaType;

  static defaultProps = {
    mediaType
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  render(): React.ReactElement<any> {
    try {
      // objectToReactElement is mutatitve so we'll clone our object
      var obj = cloneDeep(this.props.data);
      return objectToReactElement(obj);
    } catch (err) {
      return (
        <React.Fragment>
          <pre
            style={{
              backgroundColor: "ghostwhite",
              color: "black",
              fontWeight: 600,
              display: "block",
              padding: "10px",
              marginBottom: "20px"
            }}
          >
            There was an error rendering VDOM data from the kernel or notebook
          </pre>
          <code>{err.toString()}</code>
        </React.Fragment>
      );
    }
  }
}
