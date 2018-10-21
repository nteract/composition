/* @flow strict */
import * as React from "react";
import { ansiToInlineStyle } from "ansi-to-react";

type Props = {
  data: string,
  mediaType: string
};

export const Plain = (props: Props) => (
  <pre>
    {ansiToInlineStyle(props.data).map((bundle, key) => (
      <span style={bundle.style} key={key}>
        {bundle.content}
      </span>
    ))}
  </pre>
);

Plain.defaultProps = {
  mediaType: "text/plain"
};
