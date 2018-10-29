import * as React from "react";
import { debounce } from "lodash";
import { editor } from "monaco-editor";

export interface MonacoEditorProps {
  theme: string;
  mode?: string;
  onChange: (value: string) => void;
  value: string;
  editorFocused: boolean;
}

class MonacoEditor extends React.Component<MonacoEditorProps> {
  monaco?: editor.IStandaloneCodeEditor;

  static defaultProps = {
    onChange: () => {},
    editorFocused: false,
    mode: "text/plain"
  };

  monacoContainerRef: React.ElementRef<*> = React.createRef();

  componentWillMount() {
    this.componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  onDidChangeModelContent() {
    if (this.monaco && this.props.onChange) {
      this.props.onChange(this.monaco.getValue());
    }
  }

  componentDidMount() {
    this.monaco = editor.create(this.monacoContainerRef.current!, {
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

  componentDidUpdate() {
    if (!this.monaco) {
      return;
    }

    if (this.monaco.getValue() !== this.props.value) {
      // FIXME: calling setValue resets cursor position in monaco. It shouldn't!
      this.monaco.setValue(this.props.value);
    }

    const model = this.monaco.getModel();
    if (model && this.props.mode && model.getModeId() !== this.props.mode) {
      editor.setModelLanguage(model, this.props.mode);
    }

    if (this.props.theme) {
      editor.setTheme(this.props.theme);
    }
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

  render() {
    return (
      <div className="monaco cm-s-composition" ref={this.monacoContainerRef} />
    );
  }
}

export default MonacoEditor;
