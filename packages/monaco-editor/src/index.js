// @flow
/* eslint-disable class-methods-use-this */
import * as React from "react";
import ReactDOM from "react-dom";

import { of, fromEvent } from "rxjs";
import type { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

import { Map as ImmutableMap } from "immutable";

import { RichestMime } from "@nteract/display-area";

import { debounce, merge } from "lodash";

import * as monaco from "monaco-editor";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

export type MonacoEditorProps = {
  theme: string,
  mode: ?string,
  onChange: (value: string) => void,
  value: string,
  editorFocused: boolean
};

class MonacoEditor extends React.Component<MonacoEditorProps> {
  monaco: ?monaco.IStandaloneCodeEditor;
  monacoContainer: ?HTMLElement;

  static defaultProps = {
    onChange: (value: string) => {},
    editorFocused: false,
    mode: "text/plain"
  };

  constructor(props: MonacoEditorProps): void {
    super(props);
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  onDidChangeModelContent(e: any): void {
    if (this.monaco && this.props.onChange) {
      this.props.onChange(this.monaco.getValue());
    }
  }

  componentDidMount(): void {
    this.monaco = monaco.editor.create(this.monacoContainer, {
      value: this.props.value,
      language: this.props.mode,
      theme: this.props.theme,
      minimap: {
        enabled: false
      },
      autoIndent: true
    });

    if (this.props.editorFocused) {
      this.monaco.focus();
    }

    this.monaco.onDidChangeModelContent(
      this.onDidChangeModelContent.bind(this)
    );
  }

  componentDidUpdate(prevProps: MonacoEditorProps): void {
    if (!this.monaco) {
      return;
    }

    if (this.monaco.getValue() !== this.props.value) {
      // FIXME: calling setValue resets cursor position in monaco. It shouldn't!
      // $FlowFixMe: We should be detecting monaco above
      this.monaco.setValue(this.props.value);
    }

    // $FlowFixMe: We should be detecting monaco above
    this.monaco.updateOptions({
      language: this.props.mode,
      theme: this.props.theme
    });
  }

  componentWillReceiveProps(nextProps: MonacoEditorProps) {
    if (this.monaco && this.monaco.getValue() !== nextProps.value) {
      // FIXME: calling setValue resets cursor position in monaco. It shouldn't!
      this.monaco.setValue(nextProps.value);
    }
  }

  componentWillUnmount() {
    if (this.monaco) {
      this.monaco.dispose();
    }
  }

  render(): React$Element<any> {
    return (
      <div
        className="monaco cm-s-composition"
        ref={container => {
          this.monacoContainer = container;
        }}
      />
    );
  }
}

export default MonacoEditor;
