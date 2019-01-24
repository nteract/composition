import { fromJS } from "@nteract/commutable";
import * as Immutable from "immutable";
import { Action } from "redux";

import * as actionTypes from "@nteract/actions";
import {
  ContentModel,
  ContentRecord,
  ContentRef,
  ContentsRecord,
  createContentRef,
  DummyContentRecordProps,
  makeContentsRecord,
  makeDirectoryContentRecord,
  makeDirectoryModel,
  makeDocumentRecord,
  makeDummyContentRecord,
  makeFileContentRecord,
  makeFileModelRecord,
  makeNotebookContentRecord,
  NotebookModel
} from "@nteract/types";

import { file } from "./file";
import { notebook } from "./notebook";

const byRef = (
  state: Immutable.Map<ContentRef, ContentRecord>,
  action: Action
): Immutable.Map<ContentRef, ContentRecord> => {
  switch (action.type) {
    case actionTypes.CHANGE_CONTENT_NAME:
      const changeContentNameAction = action as actionTypes.ChangeContentName;
      const { contentRef, filepath } = changeContentNameAction.payload;
      return state.setIn([contentRef, "filepath"], filepath);
    case actionTypes.CHANGE_CONTENT_NAME_FAILED:
      // TODO: Add to error component for alerting the user
      return state;
    case actionTypes.FETCH_CONTENT:
      // TODO: we might be able to get around this by looking at the
      // communication state first and not requesting this information until
      // the communication state shows that it should exist.
      const fetchContentAction = action as actionTypes.FetchContent;
      return state
        .set(
          fetchContentAction.payload.contentRef,
          makeDummyContentRecord({
            filepath: fetchContentAction.payload.filepath || ""
            // TODO: we can set kernelRef when the content record uses it.
          })
        )
        .setIn([fetchContentAction.payload.filepath, "loading"], true);
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
      // TODO: is this reasonable? We launched the kernel on behalf of this
      // content... so it makes sense to swap it, right?
      const launchKernelAction = action as actionTypes.NewKernelAction;
      return state.setIn(
        [launchKernelAction.payload.contentRef, "model", "kernelRef"],
        launchKernelAction.payload.kernelRef
      );
    case actionTypes.FETCH_CONTENT_FULFILLED:
      const fetchContentFulfilledAction = action as actionTypes.FetchContentFulfilled;
      switch (fetchContentFulfilledAction.payload.model.type) {
        case "file":
          return state.set(
            fetchContentFulfilledAction.payload.contentRef,
            makeFileContentRecord({
              mimetype: fetchContentFulfilledAction.payload.model.mimetype,
              created: fetchContentFulfilledAction.payload.model.created,
              lastSaved:
                fetchContentFulfilledAction.payload.model.last_modified,
              filepath: fetchContentFulfilledAction.payload.filepath,
              model: makeFileModelRecord({
                text: fetchContentFulfilledAction.payload.model.content
              }),
              loading: false,
              saving: false,
              error: null
            })
          );
        case "directory": {
          // For each entry in the directory listing, create a new contentRef
          // and a "filler" contents object

          // Optional: run through all the current contents to see if they're
          //           a file we already have (?)

          // Create a map of <ContentRef, ContentRecord> that we merge into the
          // content refs state
          const dummyRecords = Immutable.Map<ContentRef, ContentRecord>(
            fetchContentFulfilledAction.payload.model.content.map(
              (entry: any) => {
                return [
                  createContentRef(),
                  makeDummyContentRecord({
                    mimetype: entry.mimetype,
                    // TODO: We can store the type of this content,
                    // it just doesn't have a model
                    // entry.type
                    assumedType: entry.type,
                    lastSaved: entry.last_modified,
                    filepath: entry.path
                  })
                ];
              }
            )
          );

          const items = Immutable.List<ContentRef>(dummyRecords.keys());
          const sorted: Immutable.List<string> = items.sort((aRef, bRef) => {
            const a:
              | Immutable.RecordOf<DummyContentRecordProps>
              | undefined = dummyRecords.get(aRef) as Immutable.RecordOf<
              DummyContentRecordProps
            >;
            const b:
              | Immutable.RecordOf<DummyContentRecordProps>
              | undefined = dummyRecords.get(bRef) as Immutable.RecordOf<
              DummyContentRecordProps
            >;

            if (a.assumedType === b.assumedType) {
              return a.filepath.localeCompare(b.filepath);
            }
            return a.assumedType.localeCompare(b.assumedType);
          });

          return (
            state
              // Bring in all the listed records
              .merge(dummyRecords)
              // Set up the base directory
              .set(
                fetchContentFulfilledAction.payload.contentRef,
                makeDirectoryContentRecord({
                  model: makeDirectoryModel({
                    type: "directory",
                    // The listing is all these contents in aggregate
                    items: sorted
                  }),
                  filepath: fetchContentFulfilledAction.payload.filepath,
                  lastSaved:
                    fetchContentFulfilledAction.payload.model.last_modified,
                  created: fetchContentFulfilledAction.payload.model.created,
                  loading: false,
                  saving: false,
                  error: null
                })
              )
          );
        }
        case "notebook": {
          const immutableNotebook = fromJS(
            fetchContentFulfilledAction.payload.model.content
          );

          return state.set(
            fetchContentFulfilledAction.payload.contentRef,
            makeNotebookContentRecord({
              created: fetchContentFulfilledAction.payload.created,
              lastSaved: fetchContentFulfilledAction.payload.lastSaved,
              filepath: fetchContentFulfilledAction.payload.filepath,
              model: makeDocumentRecord({
                notebook: immutableNotebook,
                savedNotebook: immutableNotebook,
                transient: Immutable.Map({
                  keyPathsForDisplays: Immutable.Map(),
                  cellMap: Immutable.Map()
                }),
                cellFocused: immutableNotebook.cellOrder.get(0)
              }),
              loading: false,
              saving: false,
              error: null
            })
          );
        }
      }

      // NOTE: There are no other content types (at the moment), so we will just
      //       warn and return the current state
      console.warn("Met some content type we don't support");
      return state;
    case actionTypes.CHANGE_FILENAME: {
      const changeFilenameAction = action as actionTypes.ChangeFilenameAction;
      return state.updateIn(
        [changeFilenameAction.payload.contentRef],
        contentRecord =>
          contentRecord.merge({
            filepath: changeFilenameAction.payload.filepath
          })
      );
    }
    case actionTypes.SAVE_FULFILLED: {
      const saveFulfilledAction = action as actionTypes.SaveFulfilled;
      return state
        .updateIn(
          [saveFulfilledAction.payload.contentRef, "model"],
          (model: ContentModel) => {
            // Notebook ends up needing this because we store a last saved version of the notebook
            // Alternatively, we could be storing a hash of the content to compare 🤔
            if (model && model.type === "notebook") {
              return notebook(model, saveFulfilledAction);
            }
            return model;
          }
        )
        .setIn(
          [saveFulfilledAction.payload.contentRef, "lastSaved"],
          saveFulfilledAction.payload.model.last_modified
        )
        .setIn([saveFulfilledAction.payload.contentRef, "loading"], false)
        .setIn([saveFulfilledAction.payload.contentRef, "saving"], false)
        .setIn([saveFulfilledAction.payload.contentRef, "error"], null);
    }
    // Defer all notebook actions to the notebook reducer
    case actionTypes.SEND_EXECUTE_REQUEST:
    case actionTypes.FOCUS_CELL:
    case actionTypes.CLEAR_OUTPUTS:
    case actionTypes.CLEAR_ALL_OUTPUTS:
    case actionTypes.RESTART_KERNEL:
    case actionTypes.APPEND_OUTPUT:
    case actionTypes.UPDATE_DISPLAY:
    case actionTypes.FOCUS_NEXT_CELL:
    case actionTypes.FOCUS_PREVIOUS_CELL:
    case actionTypes.FOCUS_CELL_EDITOR:
    case actionTypes.FOCUS_NEXT_CELL_EDITOR:
    case actionTypes.FOCUS_PREVIOUS_CELL_EDITOR:
    case actionTypes.SET_IN_CELL:
    case actionTypes.MOVE_CELL:
    case actionTypes.DELETE_CELL:
    case actionTypes.REMOVE_CELL: // DEPRECATION WARNING: This action type is being deprecated. Please use DELETE_CELL instead
    case actionTypes.CREATE_CELL_BELOW:
    case actionTypes.CREATE_CELL_ABOVE:
    case actionTypes.CREATE_CELL_AFTER: // DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_BELOW instead
    case actionTypes.CREATE_CELL_BEFORE: // DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_ABOVE instead
    case actionTypes.CREATE_CELL_APPEND:
    case actionTypes.TOGGLE_CELL_OUTPUT_VISIBILITY:
    case actionTypes.TOGGLE_CELL_INPUT_VISIBILITY:
    case actionTypes.ACCEPT_PAYLOAD_MESSAGE:
    case actionTypes.UPDATE_CELL_STATUS:
    case actionTypes.SET_LANGUAGE_INFO:
    case actionTypes.SET_KERNELSPEC_INFO:
    case actionTypes.OVERWRITE_METADATA_FIELD:
    case actionTypes.DELETE_METADATA_FIELD:
    case actionTypes.COPY_CELL:
    case actionTypes.CUT_CELL:
    case actionTypes.PASTE_CELL:
    case actionTypes.CHANGE_CELL_TYPE:
    case actionTypes.TOGGLE_OUTPUT_EXPANSION:
    case actionTypes.TOGGLE_TAG_IN_CELL:
    case actionTypes.UPDATE_OUTPUT_METADATA:
    case actionTypes.UNHIDE_ALL: {
      const cellAction = action as actionTypes.FocusCell;
      const path = [cellAction.payload.contentRef, "model"];
      const model: NotebookModel = state.get(cellAction.payload.contentRef)!
        .model as NotebookModel;
      return state.setIn(path, notebook(model, cellAction));
    }
    case actionTypes.UPDATE_FILE_TEXT: {
      const fileAction = action as actionTypes.UpdateFileText;
      const path = [fileAction.payload.contentRef, "model"];
      const model: ContentModel = state.get(fileAction.payload.contentRef)!
        .model;
      if (model && model.type === "file") {
        return state.setIn(path, file(model, fileAction));
      }
      return state;
    }
    default:
      return state;
  }
};

export const contents = (
  state: ContentsRecord = makeContentsRecord(),
  action: Action
): ContentsRecord => {
  return state.merge({
    byRef: byRef(state.byRef, action)
  });
};
