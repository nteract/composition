// @flow

export type LIST_KERNELSPECS = {
  type: "LIST_KERNELSPECS"
};

export type KERNELSPECS_LISTED = {
  type: "LISTED_KERNELSPECS",
  payload: any
};

export type KERNELSPECS_ACTIONS = LIST_KERNELSPECS | KERNELSPECS_LISTED;
