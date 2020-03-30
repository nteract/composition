import { setConfigAtKey } from "@nteract/mythic-configuration";
import { DesktopCommand } from "../types";

export const SetPreference: DesktopCommand<typeof setConfigAtKey.props> = {
  name: "SetPreference",
  props: {
    key: "required",
    value: "required",
  },
  makeAction: setConfigAtKey.create,
};
