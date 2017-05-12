// @flow
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";
import Ansi from "ansi-to-react";

import { transforms, displayOrder } from "@nteract/transforms";

import RichestMime from "./richest-mime";

type Props = {
  expanded: boolean,
  displayOrder: ImmutableList<string>,
  output: any,
  transforms: ImmutableMap<string, any>,
  theme: string,
  models: ImmutableMap<string, any>
};

const classPrefix = "nteract-display-area-";

export default function Output(props: Props): ?React.Element<any> | null {
  const output = props.output;
  const outputType = output.get("output_type");
  switch (outputType) {
    case "execute_result":
    // We can defer to display data here, the cell number will be handled
    // separately. For reference, it is output.get('execution_count')
    // The execution_count belongs in the component above if
    // this is a code cell

    // falls through
    case "display_data": {
      const bundle = output.get("data");
      const metadata = output.get("metadata");
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
      const text = output.get("text");
      const name = output.get("name");
      switch (name) {
        case "stdout":
        case "stderr":
          return <Ansi className={classPrefix + name}>{text}</Ansi>;
        default:
          return null;
      }
    }
    case "error": {
      const traceback = output.get("traceback");
      if (!traceback) {
        return (
          <Ansi
            className={classPrefix + "traceback"}
          >{`${output.get("ename")}: ${output.get("evalue")}`}</Ansi>
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
