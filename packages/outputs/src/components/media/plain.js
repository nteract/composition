/* @flow strict */
import * as React from "react";
// $FlowFixMe
import Ansi from "ansi-to-react";

type Props = {
  data: string,
  mediaType: "text/plain"
};

export const Plain = (props: Props) => (
  <pre>
    <Ansi linkify={false}>{props.data}</Ansi>
  </pre>
);

Plain.defaultProps = {
  data: '',
  mediaType: "text/plain"
};
