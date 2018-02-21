// @flow
import { combineReducers } from "redux-immutable";
import { makeCommunicationRecord } from "../../../types/state/communication";
import { kernelspecs } from "./kernelspecs";

export const communication = combineReducers(
  {
    kernelspecs
  },
  makeCommunicationRecord
);
