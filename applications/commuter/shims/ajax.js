// @flow

import { ajax } from "rxjs/observable/dom/ajax";

export function getJSON(url: string) {
  return ajax({
    url,
    responseType: "json",
    createXHR: function() {
      return new XMLHttpRequest();
    }
  });
}
