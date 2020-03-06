import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/types";
import { remote } from "electron";
import * as fs from "fs";
import * as path from "path";
import { DesktopStore } from "../../../notebook/store";

export const currentDocumentDirectory =
  (store: DesktopStore, contentRef: ContentRef) =>
    documentDirectoryFor(selectors.filepath(store.getState(), { contentRef }));

export const documentDirectoryFor = (filepath: string | null) =>
  filepath !== null
    ? path.dirname(path.resolve(filepath))
    : systemDocumentDirectory();

export function systemDocumentDirectory(): string {
  const cwd = path.normalize(process.cwd());
  const cwdIsProperDocumentDirectory =
    // launchctl on macOS might set the path to "/"
    cwd !== "/" &&
    // cwd was likely set from nteract executable
    cwd !== path.normalize(path.dirname(process.execPath)) &&
    // document dir needs to be writeable
    isWriteable(cwd);

  return cwdIsProperDocumentDirectory ? cwd : remote.app.getPath("documents");
}

function isWriteable(pathToCheck: string): boolean {
  try {
    fs.accessSync(pathToCheck, fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}
