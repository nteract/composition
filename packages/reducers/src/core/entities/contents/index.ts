// Vendor modules
import * as actionTypes from "@nteract/actions";
import { fromJS } from "@nteract/commutable";
import {
  ContentModel,
  ContentRecord,
  ContentRef,
  ContentsRecord,
  createContentRef,
  DummyContentRecordProps,
  JupyterHostRecord,
  makeContentsRecord,
  makeDirectoryContentRecord,
  makeDirectoryModel,
  makeDocumentRecord,
  makeDummyContentRecord,
  makeFileContentRecord,
  makeFileModelRecord,
  makeNotebookContentRecord,
  NotebookContentRecordProps
} from "@nteract/types";
import { List, Map, Record, RecordOf } from "immutable";
import { Action } from "redux";

// Local modules
import { file } from "./file";
import { notebook } from "./notebook";

export const byRef = (
  state: Map<ContentRef, ContentRecord>,
  action: Action
): Map<ContentRef, ContentRecord> => {
  switch (action.type) {
    case actionTypes.OVERWRITE_METADATA_FIELDS:
      const overwriteMetadataFieldsAction = action as actionTypes.OverwriteMetadataFields;
      const {
        authors,
        description,
        tags,
        title
      } = overwriteMetadataFieldsAction.payload;

      return state
        .setIn(
          [
            overwriteMetadataFieldsAction.payload.contentRef,
            "model",
            "notebook",
            "metadata",
            "authors"
          ],
          authors
        )
        .setIn(
          [
            overwriteMetadataFieldsAction.payload.contentRef,
            "model",
            "notebook",
            "metadata",
            "description"
          ],
          description
        )
        .setIn(
          [
            overwriteMetadataFieldsAction.payload.contentRef,
            "model",
            "notebook",
            "metadata",
            "tags"
          ],
          tags
        )
        .setIn(
          [
            overwriteMetadataFieldsAction.payload.contentRef,
            "model",
            "notebook",
            "metadata",
            "title"
          ],
          title
        );
    case actionTypes.TOGGLE_HEADER_EDITOR:
      const toggleHeaderAction = action as actionTypes.ToggleHeaderEditor;
      const ref = toggleHeaderAction.payload.contentRef;
      const content: any = state.get(ref);
      const prevValue = content.get("showHeaderEditor");
      // toggle header
      return state.setIn([ref, "showHeaderEditor"], !prevValue);
    case actionTypes.CHANGE_CONTENT_NAME:
      const changeContentNameAction = action as actionTypes.ChangeContentName;
      const { contentRef, filepath } = changeContentNameAction.payload;
      return state.setIn([contentRef, "filepath"], filepath);
    case actionTypes.CHANGE_CONTENT_NAME_FAILED:
      return state;
    case actionTypes.FETCH_CONTENT:
      // TODO: we might be able to get around this by looking at the
      // communication state first and not requesting this information until
      // the communication state shows that it should exist.
      const fetchContentAction = action as actionTypes.FetchContent;
      return state.set(
        fetchContentAction.payload.contentRef,
        makeDummyContentRecord({
          filepath: fetchContentAction.payload.filepath || "",
          loading: true
          // TODO: we can set kernelRef when the content record uses it.
        })
      );
    case actionTypes.FETCH_CONTENT_FAILED:
      const fetchContentFailedAction = action as actionTypes.FetchContentFailed;
      return state
        .setIn([fetchContentFailedAction.payload.contentRef, "loading"], false)
        .setIn(
          [fetchContentFailedAction.payload.contentRef, "error"],
          fetchContentFailedAction.payload.error
        );
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
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
          const dummyRecords = Map<ContentRef, ContentRecord>(
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

          const items = List<ContentRef>(dummyRecords.keys());
          const sorted: List<string> = items.sort((aRef, bRef) => {
            const a:
              | RecordOf<DummyContentRecordProps>
              | undefined = dummyRecords.get(aRef) as RecordOf<
              DummyContentRecordProps
            >;
            const b:
              | RecordOf<DummyContentRecordProps>
              | undefined = dummyRecords.get(bRef) as RecordOf<
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
              created: fetchContentFulfilledAction.payload.model.created,
              lastSaved:
                fetchContentFulfilledAction.payload.model.last_modified,
              filepath: fetchContentFulfilledAction.payload.filepath,
              model: makeDocumentRecord({
                notebook: immutableNotebook,
                savedNotebook: immutableNotebook,
                transient: Map({
                  keyPathsForDisplays: Map(),
                  cellMap: Map()
                }),
                cellFocused: immutableNotebook.getIn(["cellOrder", 0]),
                kernelRef: fetchContentFulfilledAction.payload.kernelRef
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
    case actionTypes.SAVE_AS_FULFILLED:
    case actionTypes.SAVE_FULFILLED: {
      const saveFulfilledAction = action as actionTypes.SaveFulfilled;
      return state
        .updateIn(
          [saveFulfilledAction.payload.contentRef, "model"],
          (model: ContentModel) => {
            // Notebook ends up needing this because we store
            // a last saved version of the notebook
            // Alternatively, we could be storing a hash of the
            // content to compare 🤔
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
    case actionTypes.DISPOSE_CONTENT: {
      const typedAction = action as actionTypes.DisposeContent;
      return state.delete(typedAction.payload.contentRef);
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
    case actionTypes.MARK_CELL_AS_DELETING:
    case actionTypes.UNMARK_CELL_AS_DELETING:
    case actionTypes.DELETE_CELL:
    case actionTypes.CREATE_CELL_BELOW:
    case actionTypes.CREATE_CELL_ABOVE:
    case actionTypes.CREATE_CELL_APPEND:
    case actionTypes.TOGGLE_CELL_OUTPUT_VISIBILITY:
    case actionTypes.TOGGLE_CELL_INPUT_VISIBILITY:
    case actionTypes.ACCEPT_PAYLOAD_MESSAGE:
    case actionTypes.UPDATE_CELL_STATUS:
    case actionTypes.UPDATE_CELL_EXECUTION_RESULT:
    case actionTypes.SET_LANGUAGE_INFO:
    case actionTypes.SET_KERNEL_METADATA:
    case actionTypes.OVERWRITE_METADATA_FIELD:
    case actionTypes.DELETE_METADATA_FIELD:
    case actionTypes.COPY_CELL:
    case actionTypes.CUT_CELL:
    case actionTypes.PASTE_CELL:
    case actionTypes.CHANGE_CELL_TYPE:
    case actionTypes.TOGGLE_OUTPUT_EXPANSION:
    case actionTypes.TOGGLE_TAG_IN_CELL:
    case actionTypes.UPDATE_OUTPUT_METADATA:
    case actionTypes.PROMPT_INPUT_REQUEST:
    case actionTypes.INTERRUPT_KERNEL_SUCCESSFUL:
    case actionTypes.UNHIDE_ALL: {
      const cellAction = action as actionTypes.FocusCell;
      const path = [cellAction.payload.contentRef, "model"];
      const model = state.getIn(path);
      return state.setIn(path, notebook(model, cellAction));
    }
    case actionTypes.UPDATE_FILE_TEXT: {
      const fileAction = action as actionTypes.UpdateFileText;
      const path = [fileAction.payload.contentRef, "model"];
      const model: ContentModel = state.getIn(path);
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
