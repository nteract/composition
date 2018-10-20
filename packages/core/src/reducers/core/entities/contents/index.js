/* @flow */
import * as Immutable from "immutable";
import * as actionTypes from "../../../../actionTypes";

import {
  makeFileContentRecord,
  makeFileModelRecord,
  makeDummyContentRecord,
  makeContentsRecord,
  makeDirectoryContentRecord,
  makeDirectoryModel,
  makeDocumentRecord,
  makeNotebookContentRecord
} from "../../../../state/entities/contents";

import { fromJS } from "@nteract/commutable";

import { notebook } from "./notebook";
import { file } from "./file";

import { createContentRef } from "../../../../state/refs";

import { combineReducers } from "redux-immutable";

const byRef = (state = Immutable.Map(), action) => {
  switch (action.type) {
    case actionTypes.FETCH_CONTENT:
      // TODO: we might be able to get around this by looking at the
      // communication state first and not requesting this information until
      // the communication state shows that it should exist.
      return state.set(
        action.payload.contentRef,
        makeDummyContentRecord({
          filepath: action.payload.filepath || ""
          // TODO: we can set kernelRef when the content record uses it.
        })
      );
    case actionTypes.LAUNCH_KERNEL_SUCCESSFUL:
      // TODO: is this reasonable? We launched the kernel on behalf of this
      // content... so it makes sense to swap it, right?
      return state.setIn(
        [action.payload.contentRef, "model", "kernelRef"],
        action.payload.kernelRef
      );
    case actionTypes.FETCH_CONTENT_FULFILLED:
      switch (action.payload.model.type) {
        case "file":
          return state.set(
            action.payload.contentRef,
            makeFileContentRecord({
              mimetype: action.payload.model.mimetype,
              created: action.payload.model.created,
              lastSaved: action.payload.model.last_modified,
              filepath: action.payload.filepath,
              model: makeFileModelRecord({
                text: action.payload.model.content
              })
            })
          );
        case "directory": {
          // For each entry in the directory listing, create a new contentRef
          // and a "filler" contents object

          // Optional: run through all the current contents to see if they're
          //           a file we already have (?)

          // Create a map of <ContentRef, ContentRecord> that we merge into the
          // content refs state
          const dummyRecords = Immutable.Map(
            action.payload.model.content.map(entry => {
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
            })
          );

          const items = Immutable.List(dummyRecords.keys());
          const sorted = items.sort((aRef, bRef) => {
            const a = dummyRecords.get(aRef);
            const b = dummyRecords.get(bRef);

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
                action.payload.contentRef,
                makeDirectoryContentRecord({
                  model: makeDirectoryModel({
                    // The listing is all these contents in aggregate
                    items: sorted
                  }),
                  filepath: action.payload.filepath,
                  lastSaved: action.payload.model.last_modified,
                  created: action.payload.model.created
                })
              )
          );
        }
        case "notebook": {
          const notebook = fromJS(action.payload.model.content);

          return state.set(
            action.payload.contentRef,
            makeNotebookContentRecord({
              created: action.payload.created,
              lastSaved: action.payload.lastSaved,
              filepath: action.payload.filepath,
              model: makeDocumentRecord({
                notebook,
                savedNotebook: notebook,
                transient: Immutable.Map({
                  keyPathsForDisplays: Immutable.Map(),
                  cellMap: Immutable.Map()
                }),
                cellFocused: notebook.getIn(["cellOrder", 0])
              })
            })
          );
        }
      }

      // NOTE: There are no other content types (at the moment), so we will just
      //       warn and return the current state
      console.warn("Met some content type we don't support");
      return state;
    case actionTypes.CHANGE_FILENAME: {
      return state.updateIn([action.payload.contentRef], contentRecord =>
        contentRecord.merge({
          filepath: action.payload.filepath
        })
      );
    }
    case actionTypes.SAVE_FULFILLED:
      return state
        .updateIn([action.payload.contentRef, "model"], model => {
          // Notebook ends up needing this because we store a last saved version of the notebook
          // Alternatively, we could be storing a hash of the content to compare 🤔
          if (model && model.type === "notebook") {
            return notebook(model, action);
          }
          return model;
        })
        .setIn(
          [action.payload.contentRef, "lastSaved"],
          action.payload.model.last_modified
        );
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
    case actionTypes.REMOVE_CELL:
    case actionTypes.CREATE_CELL_BELOW:
    case actionTypes.CREATE_CELL_ABOVE:
    case actionTypes.CREATE_CELL_AFTER:   // DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_BELOW instead
    case actionTypes.CREATE_CELL_BEFORE:  // DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_ABOVE instead
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
    case actionTypes.UNHIDE_ALL: {
      const path = [action.payload.contentRef, "model"];
      const model = state.getIn(path);
      return state.setIn(path, notebook(model, action));
    }
    case actionTypes.UPDATE_FILE_TEXT: {
      const path = [action.payload.contentRef, "model"];
      const model = state.getIn(path);
      if (model && model.type === "file") {
        return state.setIn(path, file(model, action));
      }
      return state;
    }
    default:
      return state;
  }
};

export const contents = combineReducers({ byRef }, makeContentsRecord);
