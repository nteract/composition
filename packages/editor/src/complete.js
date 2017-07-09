import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/pluck";
import "rxjs/add/operator/first";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";

import { createMessage } from "@nteract/messaging";

// Hint picker
export const pick = (cm, handle) => handle.pick();

export function formChangeObject(cm, change) {
  return {
    cm,
    change
  };
}

// ipykernel may return experimental completion in the metadata field,
// experiment with these. We use codemirror ability to take a rendering function
// on a per completion basis (we can't give a global one :-( to render not only
// the text, but the type as well.
// as this is not documented in CM the DOM structure of the completer will be
//
// <ul class="CodeMirror-hints" >
//  <li class="CodeMirror-hint"></li>
//  <li class="CodeMirror-hint CodeMirror-hint-active"></li>
//  <li class="CodeMirror-hint"></li>
//  <li class="CodeMirror-hint"></li>
// </ul>
// with each <li/> passed as the first argument of render.
const _expand_experimental_completions = (editor, matches, cursor) => ({
  to: cursor,
  from: cursor,
  list: matches.map(completion => ({
    text: completion.text,
    to: editor.posFromIndex(completion.end),
    from: editor.posFromIndex(completion.start),
    type: completion.type,
    render: (elt, data, completion) => {
      const span = document.createElement("span");
      const text = document.createTextNode(completion.text);
      span.className += "completion-type completion-type-" + completion.type;
      span.setAttribute("title", completion.type);
      elt.appendChild(span);
      elt.appendChild(text);
    }
  }))
});

// duplicate of default codemirror rendering logic for completions,
// except if the completion have a metadata._experimental key, dispatch to a new
// completer for these new values.
export const expand_completions = editor => results => {
  if ((results.metadata || {})._jupyter_types_experimental != undefined) {
    try {
      return _expand_experimental_completions(
        editor,
        results.metadata._jupyter_types_experimental,
        editor.getCursor()
      );
    } catch (e) {
      console.error("Exprimental completion failed :", e);
    }
  }
  return {
    list: results.matches.map(match => ({
      text: match,
      render: (elt, data, current) =>
        elt.appendChild(document.createTextNode(current.text))
    })),
    from: editor.posFromIndex(results.cursor_start),
    to: editor.posFromIndex(results.cursor_end)
  };
};

export function codeCompleteObservable(channels, editor, message) {
  const completion$ = channels.shell
    .childOf(message)
    .ofMessageType(["complete_reply"])
    .pluck("content")
    .first()
    .map(expand_completions(editor))
    .timeout(2000); // 2s

  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = completion$.subscribe(observer);
    channels.shell.next(message);
    return subscription;
  });
}

export const completionRequest = (code, cursorPos) =>
  createMessage("complete_request", {
    content: {
      code,
      cursor_pos: cursorPos
    }
  });

export function codeComplete(channels, editor) {
  const cursor = editor.getCursor();
  const cursorPos = editor.indexFromPos(cursor);
  const code = editor.getValue();

  const message = completionRequest(code, cursorPos);

  return codeCompleteObservable(channels, editor, message);
}
