import { Store } from "redux";
import { ActionCommand } from "./types";

export const dispatchCommand = <
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
