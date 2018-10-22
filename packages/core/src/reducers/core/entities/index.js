// @flow
import { combineReducers } from "redux-immutable";

import { makeEntitiesRecord } from "../../../state/entities";

import { contents } from "./contents";
import { hosts } from "./hosts";
import { kernels } from "./kernels";
import { kernelspecs } from "./kernelspecs";
import { modals } from "./modals";

export const entities = combineReducers(
  {
    contents,
    hosts,
    kernels,
    kernelspecs,
    modals
  },
  makeEntitiesRecord
);
