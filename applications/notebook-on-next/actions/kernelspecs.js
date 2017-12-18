// @flow

export type LIST_KERNELSPECS = {
  type: "LIST_KERNELSPECS"
};

export type KERNELSPECS_LISTED = {
  type: "LISTED_KERNELSPECS",
  payload: any
};

export type GENERIC_AJAX_FAIL = {
  type: "GENERIC_AJAX_FAIL",
  payload: any,
  status: number
};

export type KERNELSPECS_ACTIONS = LIST_KERNELSPECS | KERNELSPECS_LISTED;
