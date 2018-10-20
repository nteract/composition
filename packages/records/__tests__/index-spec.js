// @flow strict
import * as nteractRecords from "@nteract/records";

import { executeResult } from "@nteract/records/src/outputs/execute-result";
import { streamOutput } from "@nteract/records/src/outputs/stream";
import { displayData } from "@nteract/records/src/outputs/display-data";
import { errorOutput } from "@nteract/records/src/outputs/error";

describe("stream output", () => {
  test("can be converted from nbformat", () => {
    expect(
      streamOutput.fromNbformat({
        output_type: "stream",
        name: "stdout",
        text: ["sup\n", "yall"]
      })
    ).toEqual(
      streamOutput({
        outputType: "stream",
        name: "stdout",
        text: "sup\nyall"
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      streamOutput.fromJupyterMessage({
        header: {
          msg_type: "stream"
        },
        content: {
          name: "stdout",
          text: "it is love we must hold on to\nnever easy but we try"
        }
      })
    ).toEqual(
      streamOutput({
        outputType: "stream",
        name: "stdout",
        text: "it is love we must hold on to\nnever easy but we try"
      })
    );
  });
});

describe("display_data output", () => {
  test("can be converted from nbformat", () => {
    expect(
      displayData.fromNbformat({
        output_type: "display_data",
        data: {
          "text/plain": [
            "mind\n",
            "time\n",
            "space\n",
            "reality\n",
            "power\n",
            "soul"
          ]
        },
        metadata: { "application/json": { expanded: true } }
      })
    ).toEqual(
      displayData({
        outputType: "display_data",
        data: {
          "text/plain": "mind\ntime\nspace\nreality\npower\nsoul"
        },
        metadata: {
          "application/json": { expanded: true }
        }
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      displayData.fromJupyterMessage({
        header: {
          msg_type: "display_data"
        },
        content: {
          data: { "text/plain": "another\nDoug" },
          metadata: { "application/json": { expanded: true } }
        }
      })
    ).toEqual(
      displayData({
        outputType: "display_data",
        data: { "text/plain": "another\nDoug" },
        metadata: { "application/json": { expanded: true } }
      })
    );
  });

  test("has default values", () => {
    expect(displayData()).toEqual({
      outputType: "display_data",
      data: {},
      metadata: {}
    });
  });
});

describe("execute_result output", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.outputFromNbformat({
        output_type: "execute_result",
        execution_count: 7,
        data: {
          "text/plain": ["xandar\n", "nidavellir\n", "terra"]
        },
        metadata: { "application/json": { expanded: true } }
      })
    ).toEqual(
      executeResult({
        executionCount: 7,
        data: {
          "text/plain": "xandar\nnidavellir\nterra"
        },
        metadata: {
          "application/json": { expanded: true }
        }
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      executeResult.fromJupyterMessage({
        header: {
          msg_type: "execute_result"
        },
        content: {
          data: { anotherDay: "anotherDoug" },
          metadata: { "application/json": { expanded: false } }
        }
      })
    ).toEqual(
      executeResult({
        data: { anotherDay: "anotherDoug" },
        metadata: { "application/json": { expanded: false } }
      })
    );
  });
});

describe("error output", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.outputFromNbformat({
        output_type: "error",
        ename: "Thor",
        evalue: "Pirate Angel",
        traceback: ["sweet", "rabbit"]
      })
    ).toEqual(
      errorOutput({
        ename: "Thor",
        evalue: "Pirate Angel",
        traceback: ["sweet", "rabbit"]
      })
    );
  });

  test("can be converted from jupyter messages", () => {
    expect(
      errorOutput.fromJupyterMessage({
        header: {
          msg_type: "error"
        },
        content: {
          ename: "cats",
          evalue: "good",
          traceback: ["squirrel"]
        }
      })
    ).toEqual(
      errorOutput({
        ename: "cats",
        evalue: "good",
        traceback: ["squirrel"]
      })
    );
  });
});

describe("code cell", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.cellFromNbformat({
        cell_type: "code",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        execution_count: 2,
        source: [],
        outputs: []
      })
    ).toEqual(
      nteractRecords.makeCodeCellRecord({
        cellType: "code",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        executionCount: 2,
        source: [],
        outputs: []
      })
    );
  });
});

describe("markdown cell", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.cellFromNbformat({
        cell_type: "markdown",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    ).toEqual(
      nteractRecords.makeMarkdownCellRecord({
        cellType: "markdown",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    );
  });
});

describe("raw cell", () => {
  test("can be converted from nbformat", () => {
    expect(
      nteractRecords.cellFromNbformat({
        cell_type: "raw",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    ).toEqual(
      nteractRecords.makeRawCellRecord({
        cellType: "raw",
        metadata: {
          collapsed: false,
          outputHidden: false,
          inputHidden: false
        },
        source: []
      })
    );
  });
});
