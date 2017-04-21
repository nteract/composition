import Rx from "rxjs/Rx";

import { createMessage } from "@nteract/messaging";

export function tooltipObservable(channels, editor, message) {
  const tip$ = channels.shell
    .childOf(message)
    .ofMessageType(["inspect_reply"])
    .pluck("content")
    .first()
    .map(results => ({
      dict: results.data
    }));
  // On subscription, send the message
  return Rx.Observable.create(observer => {
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
  const cursorPos = editor.indexFromPos(cursor);
  const code = editor.getValue();

  const message = tooltipRequest(code, cursorPos);
  return tooltipObservable(channels, editor, message);
}
