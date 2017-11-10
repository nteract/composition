// @flow
import type { CONTENTS_ACTIONS } from "./contents";
import type { KERNELSPECS_ACTIONS } from "./kernelspecs";

export type GENERIC_AJAX_FAIL = {
  type: "GENERIC_AJAX_FAIL",
  payload: any,
  status: number
};

export function genericAjaxFail(ajaxError: any): GENERIC_AJAX_FAIL {
  return {
    type: "GENERIC_AJAX_FAIL",
    payload: ajaxError.response,
    status: ajaxError.status
  };
}

export type ALL_ACTIONS =
  | CONTENTS_ACTIONS
  | KERNELSPECS_ACTIONS
  | GENERIC_AJAX_FAIL;
