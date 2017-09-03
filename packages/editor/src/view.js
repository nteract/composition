// @flow
import React from "react";
import CodeMirrorWrapper from "./wrapper";

type Props = {
  children?: React$Element<any>
};

const EditorView = (props: Props): React$Element<any> => (
  <div className="input">{props.children}</div>
);

export default CodeMirrorWrapper(EditorView);
