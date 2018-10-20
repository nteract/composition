// @flow strict
import * as React from "react";

import { RichMedia } from "./rich-media";

import type { MediaBundle } from "@nteract/records";

type Props = {
  /**
   * The literal type of output, used for routing with the `<Output />` element
   */
  outputType: "display_data",
  /**
   * Object of media type → data
   *
   * E.g.
   *
   * ```js
   * {
   *   "text/plain": "raw text",
   * }
   * ```
   *
   * See [Jupyter message spec](http://jupyter-client.readthedocs.io/en/stable/messaging.html#display-data)
   * for more detail.
   *
   */
  data: MediaBundle,
  /**
   * custom settings, typically keyed by media type
   */
  metadata: {},
  /**
   * React elements that accept mimebundle data, will get passed data[mimetype]
   */
  children: React.Node
};

export const DisplayData = (props: Props) => {
  const { data, metadata, children } = props;

  return (
    <RichMedia data={data} metadata={metadata}>
      {children}
    </RichMedia>
  );
};

DisplayData.defaultProps = {
  outputType: "display_data",
  data: {},
  metadata: {}
};
