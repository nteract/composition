// @flow strict
import appendOutput from "../src/outputs/append-output";
import { mutate } from "../src/outputs/append-output";

describe("appendOutput", () => {
  test("puts new outputs at the end by default", () => {
    const outputs = [
      { outputType: "stream", name: "stdout", text: "Woo" },
      {
        outputType: "error",
        ename: "well",
        evalue: "actually",
        traceback: []
      }
    ];
    const newOutputs = appendOutput(outputs, {
      outputType: "displayData",
      data: {},
      metadata: {}
    });

    expect(newOutputs).toEqual([
      { outputType: "stream", name: "stdout", text: "Woo" },
      {
        outputType: "error",
        ename: "well",
        evalue: "actually",
        traceback: []
      },
      {
        outputType: "displayData",
        data: {},
        metadata: {}
      }
    ]);
  });

  test("handles the case of a single stream output", () => {
    const outputs = [{ name: "stdout", text: "hello", outputType: "stream" }];
    const newOutputs = appendOutput(outputs, {
      name: "stdout",
      text: " world",
      outputType: "stream"
    });

    expect(newOutputs).toEqual([
      { name: "stdout", text: "hello world", outputType: "stream" }
    ]);
  });

  test("merges streams of text", () => {
    let outputs = [];

    outputs = appendOutput(outputs, {
      name: "stdout",
      text: "hello",
      outputType: "stream"
    });

    expect(outputs).toEqual([
      { name: "stdout", text: "hello", outputType: "stream" }
    ]);
  });

  test("keeps respective streams together", () => {
    const outputs = [
      { name: "stdout", text: "hello", outputType: "stream" },
      { name: "stderr", text: "errors are", outputType: "stream" }
    ];
    const newOutputs = appendOutput(outputs, {
      name: "stdout",
      text: " world",
      outputType: "stream"
    });

    expect(newOutputs).toEqual([
      { name: "stdout", text: "hello world", outputType: "stream" },
      { name: "stderr", text: "errors are", outputType: "stream" }
    ]);

    const evenNewerOutputs = appendOutput(newOutputs, {
      name: "stderr",
      text: " informative",
      outputType: "stream"
    });

    expect(evenNewerOutputs).toEqual([
      { name: "stdout", text: "hello world", outputType: "stream" },
      {
        name: "stderr",

        text: "errors are informative",
        outputType: "stream"
      }
    ]);
  });

  test("outputs are actually immutable now", () => {
    const outputs = [
      { outputType: "stream", name: "stdout", text: "Woo" },
      {
        outputType: "error",
        ename: "well",
        evalue: "actually",
        traceback: []
      }
    ];

    const newOutputs = appendOutput(outputs, {
      outputType: "displayData",
      data: {},
      metadata: {}
    });

    expect(() => {
      newOutputs[0] = { outputType: "stream", name: "stdout", text: "Boo" };
    }).toThrow(
      (TypeError: "Cannot assign to read only property '0' of object '[object Array]'")
    );
  });

  test("outputs are appended and mutable", () => {
    const outputs = [
      { outputType: "stream", name: "stdout", text: "Woo" },
      {
        outputType: "error",
        ename: "well",
        evalue: "actually",
        traceback: []
      }
    ];

    const newOutputs = mutate.appendOutput(outputs, {
      outputType: "displayData",
      data: {},
      metadata: {}
    });

    newOutputs[0] = { outputType: "stream", name: "stdout", text: "Boo" };

    expect(newOutputs).toEqual([
      { outputType: "stream", name: "stdout", text: "Boo" },
      {
        outputType: "error",
        ename: "well",
        evalue: "actually",
        traceback: []
      },
      {
        outputType: "displayData",
        data: {},
        metadata: {}
      }
    ]);
  });
});
