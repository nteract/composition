import { actions, createKernelRef } from "@nteract/core";
import { setConfigFile } from "@nteract/mythic-configuration";
import { remote } from "electron";
import * as path from "path";
import { DesktopCommand, HasContent } from "./contents";

export const LoadConfig = {
  action: () =>
    setConfigFile(path.join(
      remote.app.getPath("home"), ".jupyter", "nteract.json",
    )),
} ;

export const Load: DesktopCommand<HasContent> = {
  *makeActionTemplates() {
    yield actions.fetchContent.with({
      // Remove the protocol string from requests originating from
      // another notebook
      filepath: filepath.replace("file://", ""),
      params: {},
      kernelRef: createKernelRef(),
    });
  },
};
