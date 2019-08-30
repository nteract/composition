import { CellType } from "@nteract/commutable";
import { actions } from "@nteract/core";
import { CodeOcticon, TriangleRightOcticon } from "@nteract/octicons";
import * as React from "react";
import { CellCommandSets, deriveAction, GapCommandSets } from "../model";

export const GAP_COMMANDS: GapCommandSets = [
  {
    appliesTo: ({ isLastGap }) => isLastGap,
    location: "toolbar-dropdown",
    commands: [
      {
        label: "Append Code Cell",
        name: "append-code-cell",
        icon: <CodeOcticon/>,
        actions: [
          deriveAction(
            actions.createCellAppend,
            {cellType: "code" as CellType},
          ),
        ],
      },
    ],
  },
  {
    appliesTo: ({ isLastGap }) => !isLastGap,
    location: "toolbar-dropdown",
    commands: [
      {
        label: "Create Code Cell Above",
        name: "create-code-cell-above",
        icon: <CodeOcticon/>,
        actions: [
          deriveAction(
            actions.createCellAbove,
            { cellType: "code" as CellType },
          ),
        ],
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
        actions: [
          deriveAction(actions.changeCellType, {to: "code" as CellType}),
        ],
      },
    ],
  },
];
