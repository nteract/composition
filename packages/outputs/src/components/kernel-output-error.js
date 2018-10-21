// @flow strict
import * as React from "react";
import Ansi from "ansi-to-react";
import type { ErrorOutput } from "@nteract/records";

type Props = ErrorOutput;

export const KernelOutputError = (props: Props) => {
  const { ename, evalue, traceback } = props;

  if (!Array.isArray(traceback) || !traceback.length) {
    return <Ansi>{`${ename}: ${evalue}`}</Ansi>;
  }

  return <Ansi>{traceback.join("\n")}</Ansi>;
};

KernelOutputError.defaultProps = {
  outputType: "error",
  ename: "",
  evalue: "",
  traceback: []
};
