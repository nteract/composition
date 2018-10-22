// @flow
import { combineReducers } from "redux-immutable";

import { makeCommunicationRecord } from "../../../state/communication";

import { contents } from "./contents";
import { kernels } from "./kernels";
import { kernelspecs } from "./kernelspecs";

export const communication = combineReducers(
  {
    contents,
    kernels,
    kernelspecs
  },
  makeCommunicationRecord
);
