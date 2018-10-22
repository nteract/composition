// @flow
import { combineReducers } from "redux-immutable";

import * as actionTypes from "../../../actionTypes";
import { makeModalsRecord } from "../../../state/entities/modals";

const modalType = (state = "", action) => {
  switch (action.type) {
    case actionTypes.OPEN_MODAL:
      return action.payload.modalType;
    case actionTypes.CLOSE_MODAL:
      return "";
    default:
      return state;
  }
};

export const modals = combineReducers({ modalType }, makeModalsRecord);
