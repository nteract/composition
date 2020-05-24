import { BrowserWindow } from "electron";
import { Store } from "redux";
import { ActionCommand } from "./types";

export const dispatchCommandInMain = <
  STORE extends Store, // <- renderer store type, different from main
  COMMAND extends ActionCommand<STORE, PROPS>,
  PROPS
>(
  command: COMMAND,
  props: PROPS,
) => {
  if (command.runInMainThread) {
    command.runInMainThread(props);
  }

  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.send("command", command.name, props);
  }
};

export const dispatchCommandInRenderer = <
  STORE extends Store,
  COMMAND extends ActionCommand<STORE, PROPS>,
  PROPS
>(
  store: STORE,
  command: COMMAND,
  props: PROPS,
) => {
  if (command.makeAction) {
    store.dispatch(command.makeAction(props));
  }

  if (command.makeActions) {
    const actions = command.makeActions(store, props);
    Promise.resolve(actions).then(
      async result => {
        for await (const action of result) {
          store.dispatch(await action);
        }
      },
    );
  }
};
