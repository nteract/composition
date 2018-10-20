// @flow
import { combineReducers } from "redux-immutable";
import { contents } from "./contents";
import { kernels } from "./kernels";
import { kernelspecs } from "./kernelspecs";
import { makeCommunicationRecord } from "../../../state/communication";

export const communication = combineReducers(
  {
    contents,
    kernels,
    kernelspecs
  },
  makeCommunicationRecord
);
