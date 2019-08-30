import { actions } from "@nteract/core";
import { TrashOcticon } from "@nteract/octicons";
import * as React from "react";
import { CellCommandSets, deriveAction } from "../model";

export const CELL_COMMANDS: CellCommandSets = [
  {
    appliesTo: () => true,
    location: "toolbar-end",
    commands: [
      {
        label: "Delete Cell",
        name: "delete-cell",
        icon: <TrashOcticon/>,
        actions: [actions.deleteCell],
      },
    ],
  },
  {
    appliesTo: () => false,
    commands: [
      {
        label: "Focus Next Cell",
        name: "focus-next-cell",
        actions: [
          deriveAction(actions.focusNextCell, {createCellIfUndefined: true}),
          actions.focusNextCellEditor,
        ],
      },
    ],
  },
];
