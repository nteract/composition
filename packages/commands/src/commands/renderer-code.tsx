import { CellType } from "@nteract/commutable";
import { actions } from "@nteract/core";
import { CodeOcticon, TriangleRightOcticon } from "@nteract/octicons";
import * as React from "react";
import { CellCommandSets, GapCommandSets, withParams } from "../model";

const CODE: CellType = "code";

export const GAP_COMMANDS: GapCommandSets = [
  {
    appliesTo: ({ isLastGap }) => isLastGap,
    location: "cell-creator",
    commands: [
      {
        label: "Append Code Cell",
        name: "append-code-cell",
        icon: <CodeOcticon/>,
        actions: [withParams(actions.createCellAppend, {cellType: CODE})],
      },
    ],
  },
  {
    appliesTo: ({ isLastGap }) => !isLastGap,
    location: "cell-creator",
    commands: [
      {
        label: "Create Code Cell Above",
        name: "create-code-cell-above",
        icon: <CodeOcticon/>,
        actions: [withParams(actions.createCellAbove, {cellType: CODE})],
      },
    ],
  },
];

export const CELL_COMMANDS: CellCommandSets = [
  {
    appliesTo: ({ type }) => type === "code",
    location: "toolbar",
    commands: [
      {
        label: "Run Cell",
        name: "run-cell",
        icon: <TriangleRightOcticon/>,
        keys: ["Ctrl+Enter", "Cmd+Enter"],
        actions: [actions.executeCell],
      },
    ],
  },
  {
    appliesTo: ({ type }) => type === "code",
    location: "toolbar-dropdown",
    commands: [
      {
        label: "Clear Cell Output",
        name: "clear-output",
        isEnabled: ({ list }) => !list("outputs").isEmpty(),
        actions: [actions.clearOutputs],
      },
      {
        label: "Show Cell Input",
        name: "toggle-input",
        isChecked: ({ metadata }) =>
          !metadata.get("inputHidden") && !metadata.get("hide_input"),
        actions: [actions.toggleCellInputVisibility],
      },
      {
        label: "Show Cell Output",
        name: "toggle-output",
        isChecked: ({ metadata }) => !metadata.get("outputHidden"),
        actions: [actions.toggleCellOutputVisibility],
      },
      {
        label: "Expanded Cell Output",
        name: "toggle-output-expanded",
        isChecked: ({ metadata }) => !!metadata.get("outputExpanded"),
        actions: [actions.toggleOutputExpansion],
      },
    ],
  },
  {
    appliesTo: ({ type }) => type !== "code",
    location: "toolbar-dropdown",
    commands: [
      {
        label: "Convert to Code Cell",
        name: "change-to-code",
        actions: [withParams(actions.changeCellType, {to: CODE})],
      },
    ],
  },
];
