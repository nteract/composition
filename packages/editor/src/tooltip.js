import { Observable } from "rxjs/Observable";
import { pluck, first, map } from "rxjs/operators";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import { js_idx_to_char_idx } from "./surrogate";

export function tooltipObservable(channels, editor, message) {
  const tip$ = channels.shell.pipe(
    childOf(message),
    ofMessageType("inspect_reply"),
    pluck("content"),
    first(),
    map(results => ({
      dict: results.data
    }))
  );
  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = tip$.subscribe(observer);
    channels.shell.next(message);
    return subscription;
  });
}

export const tooltipRequest = (code, cursorPos) =>
  createMessage("inspect_request", {
    content: {
      code,
      cursor_pos: cursorPos,
      detail_level: 0
    }
  });

export function tool(channels, editor) {
  const cursor = editor.getCursor();
  // Get position while handling surrogate pairs
  const cursorPos = js_idx_to_char_idx(
    editor.indexFromPos(cursor),
    editor.getValue()
  );
  const code = editor.getValue();

  const message = tooltipRequest(code, cursorPos);
  return tooltipObservable(channels, editor, message);
}
