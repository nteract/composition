// @flow strict
import { escapeCarriageReturnSafe } from "escape-carriage";
import produce from "immer";

import type { OutputType, StreamOutput } from "../outputs";

export function mutate() {}
/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Array<Object>} updated-outputs - Outputs + Output
 */
mutate.appendOutput = function appendOutput(
  outputs: Array<OutputType>,
  output: OutputType
): Array<OutputType> {
  const last = outputs[outputs.length - 1];

  if (
    output.outputType !== "stream" ||
    !last ||
    (outputs.length > 0 && last["outputType"] !== "stream")
  ) {
    // If it's not a stream type, we just fold in the output
    outputs.push(output);
    return outputs;
  }

  const streamOutput: StreamOutput = output;

  if (
    last &&
    outputs.length > 0 &&
    typeof streamOutput.name !== "undefined" &&
    last.outputType === "stream"
  ) {
    if (last.name === streamOutput.name) {
      const outputsLength = outputs.length - 1;
      if (outputs[outputsLength].outputType === "stream") {
        Object.assign(outputs[outputsLength], {
          text: appendText(outputs[outputsLength].text, streamOutput.text)
        });
        return outputs;
      }
    }
    const nextToLast = outputs[outputs.length - 2];
    if (
      nextToLast &&
      nextToLast.outputType === "stream" &&
      nextToLast["name"] === streamOutput.name
    ) {
      const outputsLength = outputs.length - 2;
      if (outputs[outputsLength].outputType === "stream") {
        Object.assign(outputs[outputsLength], {
          text: appendText(outputs[outputsLength].text, streamOutput.text)
        });
        return outputs;
      }
    }
  }

  outputs.push(streamOutput);
  return outputs;
};

function appendText(text: string, streamText: string): string {
  if (typeof streamText === "string") {
    return escapeCarriageReturnSafe(text + streamText);
  }
  return text;
}

const appendOutput = produce(mutate.appendOutput);

export default appendOutput;
