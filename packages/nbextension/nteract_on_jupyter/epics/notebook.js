//@flow

// When content comes in that is a notebook, we'll use these epics to react,
// spinning off kernels and making sure to load the proper content

import { monocellNotebook, fromJS, parseNotebook } from "@nteract/commutable";

import { of } from "rxjs/observable/of";
import { tap, filter, map, catchError } from "rxjs/operators";

import type { ActionsObservable } from "redux-observable";

export function setNotebookEpic(
  action$: ActionsObservable<*>,
  store: Store<*, *>
) {
  return action$.ofType("LOADED").pipe(
    tap(action => {
      console.log(action);
      if (!action.payload || !action.payload.type) {
        throw new Error("content needs a type");
      }
    }),
    filter(action => action.payload.type === "notebook"),
    map(action => ({
      type: "SET_NOTEBOOK",
      filename: action.payload.name,
      notebook: fromJS(action.payload.content)
    })),
    catchError((xhrError: any) =>
      of({ type: "ERROR", payload: xhrError, error: true })
    )
  );
}
