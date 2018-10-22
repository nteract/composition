// @flow

import * as React from "react";
import Ansi from "ansi-to-react";
import type { StreamOutput } from "@nteract/records";

type Props = StreamOutput;

export const StreamText = (props: Props) => {
  const { text, name } = props;

  return <Ansi className={`"nteract-display-area-${name}`}>{text}</Ansi>;
};

StreamText.defaultProps = {
  outputType: "stream",
  text: "",
  name: "stdout"
};
