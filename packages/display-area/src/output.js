// @flow
import React from "react";
import Ansi from "ansi-to-react";

import { transforms, displayOrder } from "@nteract/transforms";

import RichestMime from "./richest-mime";

type Props = {
  expanded: boolean,
  displayOrder: Array<string>,
  output: any,
  transforms: Object,
  theme: string,
  models: Object
};

const classPrefix = "nteract-display-area-";

export default function Output(props: Props): ?React$Element<any> | null {
  const output = props.output;
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
          expanded={props.expanded}
          bundle={bundle}
          metadata={metadata}
          displayOrder={props.displayOrder}
          transforms={props.transforms}
          theme={props.theme}
          models={props.models}
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

Output.defaultProps = {
  transforms,
  displayOrder
};
