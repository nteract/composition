import { ContentRef } from "@nteract/core";
import { ipcRenderer as ipc } from "electron";
import * as commands from "../common/commands";
import { dispatchCommand } from "../common/commands/dispatch";
import { ActionCommand } from "../common/commands/types";
import { DesktopStore } from "./store";

export function initMenuHandlers(
  contentRef: ContentRef,
  store: DesktopStore
): void {
  ipc.on(
    "command", (_event: Event, name: keyof typeof commands) => {
      const command = commands[name];

      if (!("props" in command)) {
        console.error("Cannot dispatch non-action command ${name}");
      }

      dispatchCommand(
        store,
        command as ActionCommand<any, any>,
        { contentRef },
      );
    }
  );
}
