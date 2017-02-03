import Rx from 'rxjs/Rx';

import {
  createMessage,
} from '../../../kernel/messaging';

// Hint picker
export const pick = (cm, handle) => handle.pick();

export function formChangeObject(cm, change) {
  return {
    cm,
    change,
  };
}

export function codeCompleteObservable(channels, editor, message) {
  const completion$ = channels.shell
    .childOf(message)
    .ofMessageType(['complete_reply'])
    .pluck('content')
    .first()
    .map(results => ({
      list: results.matches,
      from: editor.posFromIndex(results.cursor_start),
      to: editor.posFromIndex(results.cursor_end),
    }))
    .timeout(2000); // 4s

  // On subscription, send the message
  return Rx.Observable.create((observer) => {
    const subscription = completion$.subscribe(observer);
    channels.shell.next(message);
    return subscription;
  });
}

export const completionRequest = (code, cursorPos) =>
  createMessage(
    'complete_request',
    {
      content: {
        code,
        cursor_pos: cursorPos,
      }
    }
  );

export function codeComplete(channels, editor) {
  const cursor = editor.getCursor();
  const cursorPos = editor.indexFromPos(cursor);
  const code = editor.getValue();

  const message = completionRequest(code, cursorPos);

  return codeCompleteObservable(channels, editor, message);
}
