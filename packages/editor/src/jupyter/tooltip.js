// @flow
import { Observable } from "rxjs";
import { pluck, first, map } from "rxjs/operators";

import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import { js_idx_to_char_idx } from "./surrogate";

import type { Channels, CMI } from "../types";

export function tooltipObservable(
  channels: Channels,
  editor: CMI,
  message: Object
) {
  const tip$ = channels.pipe(
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
    channels.next(message);
    return subscription;
  });
}

export const tooltipRequest = (code: string, cursorPos: number) =>
  createMessage("inspect_request", {
    content: {
      code,
      cursor_pos: cursorPos,
      detail_level: 0
    }
  });

export function tool(channels: Channels, editor: CMI) {
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
