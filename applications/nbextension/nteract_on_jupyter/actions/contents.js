// @flow

export type SAVE_ACTION = {
  type: "SAVE",
  path: string,
  model: any
};

export type LOAD_ACTION = {
  type: "LOAD",
  path: string
};

export type LOAD_FAILED_ACTION = {
  type: "LOAD_FAILED",
  payload: any,
  status: number
};

export type LOADED_ACTION = {
  type: "LOADED",
  payload: any
};

export type CONTENTS_ACTIONS =
  | SAVE_ACTION
  | LOAD_ACTION
  | LOAD_FAILED_ACTION
  | LOADED_ACTION;
