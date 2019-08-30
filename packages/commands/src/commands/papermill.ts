import { actions } from "@nteract/core";
import { CellCommandSets } from "../model";

export const CELL_COMMANDS: CellCommandSets = [
  {
    appliesTo: ({ type }) => type === "code",
    location: "toolbar-dropdown",
    commands: [
      {
        label: "Is Parameter Cell",
        name: "toggle-parameter",
        isChecked: ({ tags }) => tags.has("parameters"),
        actions: [actions.toggleParameterCell],
      },
    ],
  },
];
