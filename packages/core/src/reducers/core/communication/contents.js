// @flow
import {
  makeContentCommunicationRecord,
  makeContentsCommunicationRecord
} from "../../../state/communication/contents";
import * as actionTypes from "../../../actionTypes";
import { combineReducers } from "redux-immutable";
import * as Immutable from "immutable";

const byRef = (state = Immutable.Map(), action) => {
  switch (action.type) {
    case actionTypes.FETCH_CONTENT:
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: true,
          saving: false,
          error: null
        })
      );
    case actionTypes.FETCH_CONTENT_FULFILLED:
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: null
        })
      );
    case actionTypes.FETCH_CONTENT_FAILED:
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: action.payload.error
        })
      );
    case actionTypes.SAVE:
    case actionTypes.SAVE_AS:
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: true,
          error: null
        })
      );
    case actionTypes.SAVE_FULFILLED:
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: null
        })
      );
    case actionTypes.SAVE_FAILED:
      return state.set(
        action.payload.contentRef,
        makeContentCommunicationRecord({
          loading: false,
          saving: false,
          error: action.payload.error
        })
      );
    default:
      return state;
  }
};

export const contents = combineReducers(
  { byRef },
  makeContentsCommunicationRecord
);
