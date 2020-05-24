import { actions } from "@nteract/core";
import { set } from "lodash";
import { DesktopCommand } from "../types";

export const SetPreference: DesktopCommand<{ key: string; value: string }> = {
  name: "SetPreference",
  props: {
    key: "required",
    value: "required",
  },
  makeAction: ({ key, value }) => actions.setConfig(set({}, key, value)),
};
