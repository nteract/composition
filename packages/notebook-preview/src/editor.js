// @flow
import React from "react";
import CodeMirrorWrapper from "@nteract/editor/lib/wrapper";

type Props = {
  children?: React$Element<any>
};

const EditorView = (props: Props): React$Element<any> =>
  <div className="input">
    {props.children}
  </div>;

export default CodeMirrorWrapper(EditorView, { readOnly: true });
