// Vendor modules
import * as actions from "@nteract/actions";
import { toJS } from "@nteract/commutable";
import { NotebookV4 } from "@nteract/commutable/lib/v4";
import * as selectors from "@nteract/selectors";
import { AppState, DirectoryContentRecordProps, DummyContentRecordProps, FileContentRecordProps, IContentProvider, NotebookContentRecordProps, ServerConfig } from "@nteract/types";
import { RecordOf } from "immutable";
import { ofType, StateObservable } from "redux-observable";
import { bookstore } from "rx-jupyter";
import { empty, Observable, of } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";
import { catchError, map, switchMap, tap } from "rxjs/operators";

/**
 * First step in publishing notebooks to bookstore.
 * Saves notebook using the `content` API. Then,
 * kicks off an action that saves the notebook
 * to `Bookstore`.
 *
 * @param action$ Action type.
 * @param state$  Application state.
 */
export function publishToBookstore(
  action$: Observable<actions.PublishToBookstore>,
  state$: StateObservable<AppState>,
  dependencies: { contentProvider: IContentProvider }
): Observable<unknown> {
  return action$.pipe(
    ofType(actions.PUBLISH_TO_BOOKSTORE),
    switchMap(action => {
      const state: any = state$.value;
      const host: any = selectors.currentHost(state);
      const serverConfig: ServerConfig = selectors.serverConfig(host);

      if (!action.payload) {
        return of({
          type: "ERROR",
          error: true,
          payload: {
            error: new Error("saving content to Bookstore needs a payload")
          }
        }) as any;
      }

      // Dismiss any usage that isn't targeting a jupyter server
      if (host.type !== "jupyter") {
        return empty();
      }

      const content:
        | RecordOf<NotebookContentRecordProps>
        | RecordOf<DummyContentRecordProps>
        | RecordOf<FileContentRecordProps>
        | RecordOf<DirectoryContentRecordProps>
        | undefined = selectors
        .contentByRef(state)
        .get(action.payload.contentRef);

      if (!content || content.type !== "notebook") {
        return of({
          type: "ERROR",
          error: true,
          payload: {
            error: new Error("Only Notebooks can be published to Bookstore")
          }
        }) as any;
      }

      const notebook: NotebookV4 = toJS(content.model.notebook);

      // Save notebook first before sending to Bookstore
      return dependencies.contentProvider
        .save(serverConfig, content.filepath, {
          content: notebook,
          type: "notebook"
        })
        .pipe(
          tap((xhr: AjaxResponse) => {
            if (xhr.status !== 200) {
              throw new Error(xhr.response);
            }
          }),
          map((nb: AjaxResponse) => {
            return actions.publishToBookstoreAfterSave({
              contentRef: action.payload.contentRef,
              model: {
                name: content.filepath.split("/").pop(),
                path: content.filepath,
                type: content.type,
                created:
                  content && content.created && content.created.toString(),
                last_modified: "",
                content: notebook,
                mimetype: content.mimetype,
                format: content.format
              }
            });
          }),
          catchError((xhrError: any) =>
            of(
              actions.publishToBookstoreFailed({
                error: xhrError,
                contentRef: action.payload.contentRef
              })
            )
          )
        );
    })
  );
}

/**
 * Last step in publishing notebooks to bookstore.
 * Saves notebook to `Bookstore`.
 *
 * @param action$ Action type.
 * @param state$  Application state.
 */
export function publishToBookstoreAfterSave(
  action$: Observable<actions.PublishToBookstoreAfterSave>,
  state$: StateObservable<AppState>
): Observable<void | actions.PublishToBookstoreFailed> {
  const state: any = state$.value;
  const host: any = selectors.currentHost(state);
  const serverConfig: ServerConfig = selectors.serverConfig(host);

  return action$.pipe(
    ofType(actions.PUBLISH_TO_BOOKSTORE_AFTER_SAVE),
    switchMap(action => {
      const targetPath: string = action.payload.model.path;
      const model: any = action.payload.model;

      // Publish notebook to Bookstore
      return bookstore.publish(serverConfig, targetPath, model).pipe(
        tap((xhr: AjaxResponse) => {
          if (xhr.status !== 200) {
            throw new Error(xhr.response);
          }
        }),
        map(() => {
          actions.publishToBookstoreSucceeded({
            contentRef: action.payload.contentRef
          });
        }),
        catchError((xhrError: any) =>
          of(
            actions.publishToBookstoreFailed({
              error: xhrError,
              contentRef: action.payload.contentRef
            })
          )
        )
      );
    })
  );
}
