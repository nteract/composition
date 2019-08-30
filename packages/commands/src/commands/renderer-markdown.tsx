import { CellType } from "@nteract/commutable";
import { actions } from "@nteract/core";
import { MarkdownOcticon } from "@nteract/octicons";
import * as React from "react";
import { CellCommandSets, GapCommandSets, withParams } from "../model";

const MARKDOWN: CellType = "markdown";

export const GAP_COMMANDS: GapCommandSets = [
  {
    appliesTo: ({ isLastGap }) => isLastGap,
    location: "cell-creator",
    commands: [
      {
        label: "Append Markdown Cell",
        name: "append-markdown-cell",
        icon: <MarkdownOcticon/>,
        actions: [withParams(actions.createCellAppend, {cellType: MARKDOWN})],
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
        actions: [withParams(actions.createCellAbove, {cellType: MARKDOWN})],
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
        actions: [withParams(actions.changeCellType, {to: MARKDOWN})],
      },
    ],
  },
];
