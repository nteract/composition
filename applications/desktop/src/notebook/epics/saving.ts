import { stringifyNotebook, toJS } from "@nteract/commutable";
import { actions, AppState, selectors } from "@nteract/core";
import { writeFileObservable } from "fs-observable";
import { ActionsObservable, ofType, StateObservable } from "redux-observable";
import { of } from "rxjs";
import { catchError, concatMap, map, mergeMap } from "rxjs/operators";

/**
 * Cleans up the notebook document and saves the file.
 *
 * @param  {ActionObservable}  action$ The SAVE action with the filename and notebook
 */
export function saveEpic(
  action$: ActionsObservable<actions.Save>,
  state$: StateObservable<AppState>
) {
  return action$.pipe(
    ofType(actions.SAVE),
    mergeMap(action => {
      const state = state$.value;
      const contentRef = action.payload.contentRef;

      const content = selectors.content(state, { contentRef });
      if (!content) {
        return of(
          actions.saveFailed({
            contentRef: action.payload.contentRef,
            error: new Error("no notebook loaded to save")
          })
        );
      }
      const model = content.model;

      if (!model || model.type !== "notebook") {
        return of(
          actions.saveFailed({
            contentRef: action.payload.contentRef,
            error: new Error("no notebook loaded to save")
          })
        );
      }

      const filepath = content.filepath;
      const appVersion = selectors.appVersion(state);
      const notebook = stringifyNotebook(
        toJS(
          model.notebook.setIn(["metadata", "nteract", "version"], appVersion)
        )
      );
      return writeFileObservable(filepath, notebook).pipe(
        map(() => {
          //Save Successful - removed notification

          return actions.saveFulfilled({
            contentRef: action.payload.contentRef,
            model: {
              last_modified: new Date()
            }
          });
        }),
        catchError((error: Error) =>
          of(
            actions.saveFailed({
              contentRef: action.payload.contentRef,
              error
            })
          )
        )
      );
    })
  );
}

/**
 * Sets the filename for a notebook before saving.
 *
 * @param  {ActionObservable}  action$ The SAVE_AS action with the filename and notebook
 */
export function saveAsEpic(action$: ActionsObservable<actions.SaveAs>) {
  return action$.pipe(
    ofType(actions.SAVE_AS),
    concatMap(action => {
      return [
        // Using concatMap because order matters here.
        // Filename state MUST be updated before save in all cases
        actions.changeFilename({
          contentRef: action.payload.contentRef,
          filepath: action.payload.filepath
        }),
        actions.save({
          contentRef: action.payload.contentRef
        })
      ];
    })
  );
}
