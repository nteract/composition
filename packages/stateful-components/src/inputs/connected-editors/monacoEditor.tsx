import { HasPrivateLanguageInfoState, lineWrappingOfCell, modeOfCell } from "@nteract/mythic-notebook";
import { connect } from "react-redux";

import { AppState, ContentRef } from "@nteract/core";
import * as monaco from "@nteract/monaco-editor";

import { userTheme } from "../../config-options";
import { Channels } from "@nteract/messaging";
import { createConfigCollection, HasPrivateConfigurationState } from "@nteract/mythic-configuration";

const monacoConfig = createConfigCollection({
  key: "monaco",
});

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  editorType: string;
  readOnly?: boolean;
  value: string;
  channels: Channels;
  editorFocused: boolean;
}

function getMonacoTheme(theme?: string) : string {
  if (typeof theme === "string" && theme === "dark") {
    return monaco.DarkThemeName;
  } else {
    return monaco.LightThemeName;
  }
}

const makeMapStateToProps = (initialState: AppState & HasPrivateConfigurationState & HasPrivateLanguageInfoState, ownProps: ComponentProps) =>
  (state: AppState & HasPrivateConfigurationState & HasPrivateLanguageInfoState) => ({
      language: modeOfCell(state, ownProps, "monaco") ?? "plaintext",
      theme : getMonacoTheme(userTheme(state)),
      enableCompletion: true,
      shouldRegisterDefaultCompletion: true,
      indentSize: 4,
      lineNumbers: false,
      tabSize: 4,
      options: {
        wordWrap: (lineWrappingOfCell(state, ownProps) ?? true) ? "on" : "off",
        autoClosingBrackets: "never",
        ...monacoConfig(state),
      },
    });

export default connect(makeMapStateToProps)(monaco.default);
