// @flow
import React from "react";

type Props = {
  executionCount: any,
  running: boolean
};

export default function Inputs(props: Props): ?React.Element<any> {
  const { executionCount, running } = props;
  const count = !executionCount ? " " : executionCount;
  const input = running ? "*" : count;

  return (
    <div className="prompt">
      [{input}]
    </div>
  );
}
