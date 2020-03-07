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
  const templates = command.makeActionTemplates(store, props);
  Promise.resolve(templates).then(
    async result => {
      for await (const template of result) {
        const action = await template(props);
        if (action !== undefined) {
          store.dispatch(action);
        }
      }
    },
  );
};
