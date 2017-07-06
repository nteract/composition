// @flow
import React from "react";
import CodeMirrorWrapper from "@nteract/editor/lib/wrapper";

type Props = {
  children?: React.Element<*>
};

const EditorView = (props: Props): React.Element<*> =>
  <div className="input">
    {props.children}
  </div>;

export default CodeMirrorWrapper(EditorView, { readOnly: true });
