import Ansi from "ansi-to-react";
import * as React from "react";

interface Props {
  data: string;
  mediaType: "text/plain";
}

export const Plain = (props: Props) => (
  <pre>
    <Ansi linkify>{props.data}</Ansi>
  </pre>
);

Plain.defaultProps = {
  data: "",
  mediaType: "text/plain"
};

Plain.displayName = "Plaintext";

export default Plain;
