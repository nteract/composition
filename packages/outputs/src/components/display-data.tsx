import * as React from "react";

import { ImmutableDisplayData } from "@nteract/commutable";

import { RichMedia, RichMediaProps } from "./rich-media";

interface Props {
  /**
   * The literal type of output, used for routing with the `<Output />` element
   */
  output_type: "display_data";
  output: ImmutableDisplayData;
  /**
   * React elements that accept media bundle data, will get passed `data[mediaType]`
   */
  children: RichMediaProps["children"];
}

export const DisplayData = (props: Props) => {
  const { output, children } = props;
  if (!output) {
    return null;
  }

  return (
    <RichMedia data={output.data} metadata={output.metadata}>
      {children}
    </RichMedia>
  );
};

DisplayData.defaultProps = {
  output_type: "display_data",
  output: null
};

export default DisplayData;
