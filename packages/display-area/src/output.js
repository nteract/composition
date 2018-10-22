// @flow
import React from "react";
import Ansi from "ansi-to-react";
import { transforms, displayOrder } from "@nteract/transforms";
import * as Immutable from "immutable";

import RichestMime from "./richest-mime";

type Props = {
  displayOrder: Array<string>,
  output: any,
  transforms: Object,
  theme: string,
  models: Object,
  channels?: rxjs$Subject<any>
};

const classPrefix = "nteract-display-area-";

export default class Output extends React.Component<Props, null> {
  static defaultProps = {
    models: {},
    theme: "light",
    transforms,
    displayOrder
  };

  shouldComponentUpdate(nextProps: Props) {
    return (
      // NOTE: this only does a shallow comparison that mostly only works
      //       well for Immutable Outputs
      nextProps.output !== this.props.output ||
      nextProps.displayOrder !== this.props.displayOrder ||
      nextProps.transforms !== this.props.transforms ||
      nextProps.theme !== this.props.theme ||
      nextProps.models !== this.props.models ||
      nextProps.channels !== this.props.channels
    );
  }

  render() {
    let output = this.props.output;
    let models = this.props.models;

    // TODO: Incorporate the new output record types into both commutable and the react components that use them
    if (Immutable.isImmutable(output)) {
      output = output.toJS();
    }
    if (Immutable.isImmutable(models)) {
      models = models.toJS();
    }

    const outputType = output.output_type;

    switch (outputType) {
      case "execute_result":
      // We can defer to display data here, the cell number will be handled
      // separately. For reference, it is output.execution_count
      // The execution_count belongs in the component above if
      // this is a code cell

      // falls through
      case "display_data": {
        const bundle = output.data;
        const metadata = output.metadata;
        return (
          <RichestMime
            bundle={bundle}
            metadata={metadata}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
            theme={this.props.theme}
            models={models}
            channels={this.props.channels}
          />
        );
      }
      case "stream": {
        const text = output.text;
        const name = output.name;
        switch (name) {
          case "stdout":
          case "stderr":
            return <Ansi className={classPrefix + name}>{text}</Ansi>;
          default:
            return null;
        }
      }
      case "error": {
        const traceback = output.traceback;
        if (!traceback) {
          return (
            <Ansi className={classPrefix + "traceback"}>{`${output.ename}: ${
              output.evalue
            }`}</Ansi>
          );
        }
        return (
          <Ansi className={classPrefix + "traceback"}>
            {traceback.join("\n")}
          </Ansi>
        );
      }
      default:
        return null;
    }
  }
}
