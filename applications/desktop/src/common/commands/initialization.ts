import { setConfigFile } from "@nteract/mythic-configuration";
import { remote } from "electron";
import * as path from "path";

export const LoadConfig = {
  action: () =>
    setConfigFile(path.join(
      remote.app.getPath("home"), ".jupyter", "nteract.json",
    )),
} ;
