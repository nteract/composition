// @flow

import { ajax } from "rxjs/ajax";

export function getJSON(url: string) {
  return ajax({
    url,
    responseType: "json",
    createXHR: function() {
      return new XMLHttpRequest();
    }
  });
}
