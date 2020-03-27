import Ansi from "ansi-to-react";
import * as React from "react";
import styled from "styled-components";

import { ImmutableErrorOutput } from "@nteract/commutable";

interface Props {
  className?: string;
  output: ImmutableErrorOutput;
  output_type: "error";
}

const PlainKernelOutputError = (props: Partial<Props>) => {
  const { output } = props;
  if (!output) {
    return null;
  }

  const { ename, evalue, traceback = [] } = output;

  // Allow traceback to be Immutable.List or Array
  const joinedTraceback =
    typeof traceback.join === "function" ? traceback.join("\n") : traceback;

  const kernelOutputError = [];

  if (joinedTraceback) {
    kernelOutputError.push(joinedTraceback);
  } else {
    if (ename && evalue) {
      kernelOutputError.push(`${ename}: ${evalue}`);
    }
  }

  return (
    <Ansi className={props.className} linkify={false}>
      {kernelOutputError.join("\n")}
    </Ansi>
  );
};

export const KernelOutputError = styled(PlainKernelOutputError)`
  white-space: pre-wrap;
`;

KernelOutputError.defaultProps = {
  output_type: "error"
};

KernelOutputError.displayName = "KernelOutputError";

export default KernelOutputError;
