import { Action } from "redux";
import { makeEpics } from "./epics";
import { makeCreateConnectedComponent } from "./react";
import { makeReducer } from "./reducer";
import { Myth, MythDefinition, MythicAction, Myths } from "./types";

export const makeCreateMyth =
  <PKG extends string, STATE>(pkg: PKG, myths: Myths<PKG, STATE>) =>
    <NAME extends string>(name: NAME) =>
      <PROPS>(
        definition: MythDefinition<STATE, PROPS>,
      ): Myth<PKG, NAME, PROPS, STATE> => {
        type OurMyth = Myth<PKG, NAME, PROPS, STATE>;

        if (myths.hasOwnProperty(name)) {
          throw new Error(`Package "${pkg}" cannot have two myths with the same name ("${name}")`);
        }

        const mythWIP: Partial<OurMyth> = {
          // Strings identifying this myth
          pkg,
          name,
          type: `${pkg}/${name}`,

          // for use in typeof expressions:
          props: undefined as unknown as PROPS,
          state: undefined as unknown as STATE,
          action: undefined as unknown as MythicAction<PKG, NAME, PROPS>,
        };

        // Function to create actions
        mythWIP.create =
          (payload: PROPS) => ({ type: mythWIP.type!, payload });

        // Epics to include into our rootEpic
        mythWIP.epics =
          makeEpics(pkg, mythWIP as OurMyth, definition);

        // Is this action one of ours?
        mythWIP.appliesTo =
          (action: Action) => action.type === mythWIP.type;

        // Reducer for our action
        mythWIP.reduce =
          makeReducer(definition.reduce, mythWIP.appliesTo);

        // Make a component that has access to our action
        mythWIP.createConnectedComponent =
          makeCreateConnectedComponent(mythWIP as OurMyth);

        const myth: OurMyth = mythWIP as OurMyth;
        myths[name] = myth;
        return myth;
      };
