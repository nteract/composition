// @flow
import { Observable } from "rxjs";
import { first, map, timeout } from "rxjs/operators";
import { createMessage, childOf, ofMessageType } from "@nteract/messaging";

import type { EditorChange, CMI } from "../types";

import { js_idx_to_char_idx, char_idx_to_js_idx } from "./surrogate";


// Hint picker
export const pick = (cm: any, handle: { pick: () => void }) => handle.pick();

export function formChangeObject(cm: CMI, change: EditorChange) {
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
export const expand_completions = (editor: any) => (results: any) => {
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

  let start = results.cursor_start;
  let end = results.cursor_end;

  if (end === null) {
    // adapted message spec replies don't have cursor position info,
    // interpret end=null as current position,
    // and negative start relative to that
    end = editor.indexFromPos(editor.getCursor());
    if (start === null) {
      start = end;
    } else if (start < 0) {
      start = end + start;
    }
  } else {
    // handle surrogate pairs
    // HACK: This seems susceptible to timing issues, we could verify changes in
    //       what's in the editor, as we'll be able to correlate across events
    //       Suggestions and background in https://github.com/nteract/nteract/pull/1840#discussion_r133380430
    const text = editor.getValue();
    end = char_idx_to_js_idx(end, text);
    start = char_idx_to_js_idx(start, text);
  }

  return {
    list: results.matches.map(match => ({
      text: match,
      render: (elt, data, current) =>
        elt.appendChild(document.createTextNode(current.text))
    })),
    from: editor.posFromIndex(start),
    to: editor.posFromIndex(end)
  };
};

export function codeCompleteObservable(
  channels: Channels,
  editor: CMI,
  message: Object
) {
  const completion$ = channels.pipe(
    childOf(message),
    ofMessageType("complete_reply"),
    map(entry => entry.content),
    first(),
    map(expand_completions(editor)),
    timeout(15000) // Large timeout for slower languages; this is just here to make sure we eventually clean up resources
  );

  // On subscription, send the message
  return Observable.create(observer => {
    const subscription = completion$.subscribe(observer);
    channels.next(message);
    return subscription;
  });
}

export const completionRequest = (code: string, cursorPos: number) =>
  createMessage("complete_request", {
    content: {
      code,
      cursor_pos: cursorPos
    }
  });

export function codeComplete(channels: Channels, editor: any) {
  const cursor = editor.getCursor();
  let cursorPos = editor.indexFromPos(cursor);
  const code = editor.getValue();
  cursorPos = js_idx_to_char_idx(cursorPos, code);

  const message = completionRequest(code, cursorPos);

  return codeCompleteObservable(channels, editor, message);
}
