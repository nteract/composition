// @flow
// Originally from https://github.com/JedWatson/react-codemirror/pull/97

const React = require("react");
const ReactDOM = require("react-dom");
const className = require("classnames");
const debounce = require("lodash").debounce;

import type { EditorChange, ScrollInfo, CMI, CMDoc } from "./types";

function normalizeLineEndings(str) {
  if (!str) return str;
  return str.replace(/\r\n|\r/g, "\n");
}

type CodeMirrorProps = {
  className: string,
  codeMirrorInstance?: any,
  defaultValue?: string,
  onChange: (value: string, change: EditorChange) => void,
  onFocusChange: (focused: boolean) => void,
  onScroll: (scrollInfo: ScrollInfo) => any,
  options: any,
  path?: string,
  value: string,
  preserveScrollPosition: boolean
};

class CodeMirror extends React.Component<CodeMirrorProps, *> {
  static defaultProps = {
    preserveScrollPosition: false,
    onScroll: () => {}
  };

  textarea: ?HTMLTextAreaElement;
  codeMirror: CMI;

  constructor(props: CodeMirrorProps) {
    super(props);
    (this: any).getCodeMirrorInstance = this.getCodeMirrorInstance.bind(this);
    (this: any).scrollChanged = this.scrollChanged.bind(this);
    (this: any).focus = this.focus;
    (this: any).focusChanged = this.focusChanged;
    (this: any).codemirrorValueChanged = this.codemirrorValueChanged;
    (this: any).getCodeMirror = this.getCodeMirror;
    this.state = {
      isFocused: false
    };
  }

  componentWillMount() {
    (this: any).componentWillReceiveProps = debounce(
      this.componentWillReceiveProps,
      0
    );
  }

  componentDidMount() {
    const textareaNode = this.textarea;
    const codeMirrorInstance = this.getCodeMirrorInstance();

    this.codeMirror = codeMirrorInstance.fromTextArea(
      this.textarea,
      this.props.options
    );
    this.codeMirror.on("change", this.codemirrorValueChanged.bind(this));
    this.codeMirror.on("focus", this.focusChanged.bind(this, true));
    this.codeMirror.on("blur", this.focusChanged.bind(this, false));
    this.codeMirror.on("scroll", this.scrollChanged.bind(this));
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || "");
  }

  componentWillUnmount() {
    // TODO: is there a lighter weight way to remove the codemirror instance
    if (this.codeMirror) {
      this.codeMirror.toTextArea();
    }
  }

  componentWillReceiveProps(nextProps: CodeMirrorProps) {
    if (
      this.codeMirror &&
      nextProps.value !== undefined &&
      normalizeLineEndings(this.codeMirror.getValue()) !==
        normalizeLineEndings(nextProps.value)
    ) {
      if (this.props.preserveScrollPosition) {
        var prevScrollPosition = this.codeMirror.getScrollInfo();
        this.codeMirror.setValue(nextProps.value);
        this.codeMirror.scrollTo(
          prevScrollPosition.left,
          prevScrollPosition.top
        );
      } else {
        this.codeMirror.setValue(nextProps.value);
      }
    }
    if (typeof nextProps.options === "object") {
      for (let optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, nextProps.options[optionName]);
        }
      }
    }
  }

  getCodeMirrorInstance() {
    return this.props.codeMirrorInstance || require("codemirror");
  }

  getCodeMirror() {
    return this.codeMirror;
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  }

  focusChanged(focused: boolean) {
    this.setState({
      isFocused: focused
    });
    this.props.onFocusChange && this.props.onFocusChange(focused);
  }

  scrollChanged(cm: CMI) {
    this.props.onScroll(cm.getScrollInfo());
  }

  codemirrorValueChanged(doc: CMDoc, change: EditorChange) {
    if (this.props.onChange && change.origin !== "setValue") {
      this.props.onChange(doc.getValue(), change);
    }
  }

  render() {
    const editorClassName = className(
      "ReactCodeMirror",
      this.state.isFocused ? "ReactCodeMirror--focused" : null,
      this.props.className
    );

    return (
      <div className={editorClassName}>
        <div className="CodeMirror cm-s-composition CodeMirror-wrap">
          <textarea
            ref={ta => {
              this.textarea = ta;
            }}
            name={this.props.path}
            defaultValue={this.props.value}
            autoComplete="off"
            className="CodeMirror-code initialTextAreaForCodeMirror"
          />
        </div>
      </div>
    );
  }
}

module.exports = CodeMirror;
