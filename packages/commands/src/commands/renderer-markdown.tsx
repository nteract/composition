import { CellType } from "@nteract/commutable";
import { actions } from "@nteract/core";
import { MarkdownOcticon } from "@nteract/octicons";
import * as React from "react";
import { CellCommandSets, deriveAction, GapCommandSets } from "../model";

export const GAP_COMMANDS: GapCommandSets = [
  {
    appliesTo: ({ isLastGap }) => isLastGap,
    location: "cell-creator",
    commands: [
      {
        label: "Append Markdown Cell",
        name: "append-markdown-cell",
        icon: <MarkdownOcticon/>,
        actions: [
          deriveAction(
            actions.createCellAppend,
            {cellType: "markdown" as CellType},
          ),
        ],
      },
    ],
  },
  {
    appliesTo: ({ isLastGap }) => !isLastGap,
    location: "cell-creator",
    commands: [
      {
        label: "Create Markdown Cell Above",
        name: "create-markdown-cell-above",
        icon: <MarkdownOcticon/>,
        actions: [
          deriveAction(
            actions.createCellAbove,
            { cellType: "markdown" as CellType },
          ),
        ],
      },
    ],
  },
];

export const CELL_COMMANDS: CellCommandSets = [
  {
    appliesTo: ({ type }) => type !== "markdown",
    location: "toolbar-dropdown",
    commands: [
      {
        label: "Convert to Markdown Cell",
        name: "change-to-markdown",
        actions: [
          deriveAction(actions.changeCellType, {to: "markdown" as CellType}),
        ],
      },
    ],
  },
];
