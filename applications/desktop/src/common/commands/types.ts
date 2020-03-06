import { ContentRef, KernelspecInfo } from "@nteract/core";
import { Action, Store } from "redux";
import { DesktopStore } from "../../notebook/store";

export type ActionTemplate<PROPS> =
  | ((props: PROPS) => Action | Promise<Action | undefined>)
  | ((props: {})    => Action | Promise<Action | undefined>)
  ;

export type ActionTemplateGenerator<PROPS> =
  | Generator<ActionTemplate<PROPS>>
  | AsyncGenerator<ActionTemplate<PROPS>>
  ;

export interface ActionCommand<STORE extends Store, PROPS> {
  name: string;
  makeActionTemplates: (store: STORE, props: PROPS) =>
    ActionTemplateGenerator<PROPS>;
}

export type Command =
  | ActionCommand<Store, {}>
  | {
      name: string;
      mapToElectronRole: string;
    }
  ;

export interface RequiresContent { contentRef: ContentRef }
export interface RequiresKernelSpec { kernelSpec: KernelspecInfo }

export type DesktopCommand<PROPS = {}> = ActionCommand<DesktopStore, PROPS>;

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
