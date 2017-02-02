// @flow
import React from 'react';

import CodeMirror from 'react-codemirror';
import CM from 'codemirror';

import Rx from 'rxjs/Rx';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';

// matching & closing parentheses and quotations
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';

import 'codemirror/addon/dialog/dialog';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/julia/julia';
import 'codemirror/mode/r/r';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/comment/comment.js';

import './codemirror-ipython';

import { codeComplete, pick } from './complete';

import { focusCell, focusCellEditor, updateCellSource } from '../../../actions';

type Props = {
  autoCloseBrackets?: boolean,
  id: string,
  input: any,
  completion?: boolean,
  language: string,
  tabSize?: number,
  lineNumbers?: boolean,
  lineWrapping?: boolean,
  onChange?: (text: string) => void,
  matchBrackets?: boolean,
  theme: string,
  cmtheme?: string,
  cellFocused: boolean,
  editorFocused: boolean,
  focusAbove: Function,
  focusBelow: Function,
  cursorBlinkRate: number,
};

type State = {
  source: string,
};

function goLineUpOrEmit(editor: Object): void {
  const cursor = editor.getCursor();
  if (cursor.line === 0 && cursor.ch === 0 && !editor.somethingSelected()) {
    CM.signal(editor, 'topBoundary');
  } else {
    editor.execCommand('goLineUp');
  }
}

function goLineDownOrEmit(editor: Object): void {
  const cursor = editor.getCursor();
  const lastLineNumber = editor.lastLine();
  const lastLine = editor.getLine(lastLineNumber);
  if (cursor.line === lastLineNumber &&
      cursor.ch === lastLine.length &&
      !editor.somethingSelected()) {
    CM.signal(editor, 'bottomBoundary');
  } else {
    editor.execCommand('goLineDown');
  }
}

/* eslint-disable quote-props */
const excludedIntelliSenseTriggerKeys = {
  '8': 'backspace',
  '9': 'tab',
  '13': 'enter',
  '16': 'shift',
  '17': 'ctrl',
  '18': 'alt',
  '19': 'pause',
  '20': 'capslock',
  '27': 'escape',
  '32': 'space',
  '33': 'pageup',
  '34': 'pagedown',
  '35': 'end',
  '36': 'home',
  '37': 'left',
  '38': 'up',
  '39': 'right',
  '40': 'down',
  '45': 'insert',
  '46': 'delete',
  '91': 'left window key',
  '92': 'right window key',
  '93': 'select',
  '107': 'add',
  '109': 'subtract',
  '110': 'decimal point',
  '111': 'divide',
  '112': 'f1',
  '113': 'f2',
  '114': 'f3',
  '115': 'f4',
  '116': 'f5',
  '117': 'f6',
  '118': 'f7',
  '119': 'f8',
  '120': 'f9',
  '121': 'f10',
  '122': 'f11',
  '123': 'f12',
  '144': 'numlock',
  '145': 'scrolllock',
  '186': 'semicolon',
  '187': 'equalsign',
  '188': 'comma',
  '189': 'dash',
  // '190': 'period',
  // '191': 'slash',
  '192': 'graveaccent',
  '220': 'backslash',
  '222': 'quote',
};
/* eslint-enable quote-props */

CM.keyMap.basic.Up = 'goLineUpOrEmit';
CM.keyMap.basic.Down = 'goLineDownOrEmit';
CM.commands.goLineUpOrEmit = goLineUpOrEmit;
CM.commands.goLineDownOrEmit = goLineDownOrEmit;

export default class Editor extends React.PureComponent {
  state: State;
  onChange: (text: string) => void;
  onFocusChange: (focused: boolean) => void;
  tabToSpaces: (editor: Object) => void;
  hint: (editor: Object, cb: Function) => void;
  theme: string|null;
  cursorBlinkRate: number;
  codemirror: CodeMirror;
  focus: () => void;

  static contextTypes = {
    store: React.PropTypes.object,
  };

  static defaultProps = {
    autoCloseBrackets: true, // automatically closes opening parens and quotations
    language: 'python',
    lineNumbers: false,
    matchBrackets: true, // highlights parens that are paired
    cmtheme: 'composition',
    cellFocused: false,
  };

  constructor(props: Props): void {
    super(props);
    this.state = {
      source: this.props.input,
    };
    this.onChange = this.onChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.tabToSpaces = this.tabToSpaces.bind(this);
    this.hint = this.completions.bind(this);
    this.hint.async = true;

    // Remember the name of the theme that's applied so that when it changes we
    // can force codemirror to remeasure.
    this.theme = null;
  }

  componentDidMount(): void {
    // On first load, if focused, set codemirror to focus

    if (this.props.editorFocused) {
      this.codemirror.focus();
    }

    const cm = this.codemirror.getCodeMirror();
    const store = this.context.store;

    cm.on('topBoundary', this.props.focusAbove);
    cm.on('bottomBoundary', this.props.focusBelow);

    const keyupEvents = Rx.Observable.fromEvent(cm, 'keyup', (editor, ev) => ({ editor, ev }));

    keyupEvents
      .switchMap(i => Rx.Observable.of(i))
      .subscribe(({ editor, ev }) => {
        const cursor = editor.getDoc().getCursor();
        const token = editor.getTokenAt(cursor);

        if (!editor.state.completionActive &&
            !excludedIntelliSenseTriggerKeys[(ev.keyCode || ev.which).toString()] &&
            (token.type === 'tag' || token.type === 'variable' || token.string === ' ' ||
             token.string === '<' || token.string === '/') &&
            store.getState().app.executionState === 'idle') {
          editor.execCommand('autocomplete', { completeSingle: false });
        }
      });
  }

  componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      source: nextProps.input,
    });
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.props.editorFocused && prevProps.editorFocused !== this.props.editorFocused) {
      this.codemirror.focus();
    } else if (!this.props.editorFocused && prevProps.editorFocused !== this.props.editorFocused) {
      const cm = this.codemirror.getCodeMirror();
      cm.getInputField().blur();
    }

    if (this.theme !== this.props.theme) {
      this.theme = this.props.theme;
      this.codemirror.getCodeMirror().refresh();
    }
    if (this.cursorBlinkRate !== this.props.cursorBlinkRate) {
      this.cursorBlinkRate = this.props.cursorBlinkRate;
      const cm = this.codemirror.getCodeMirror();
      cm.setOption('cursorBlinkRate', this.cursorBlinkRate);
      if (this.props.editorFocused) {
        // code mirror doesn't change the blink rate immediately, we have to
        // move the cursor, or unfocus and refocus the editor to get the blink
        // rate to update - so here we do that (unfocus and refocus)
        cm.getInputField().blur();
        cm.focus();
      }
    }
  }

  onChange(text: string): void {
    if (this.props.onChange) {
      this.props.onChange(text);
    } else {
      this.setState({
        source: text,
      });
      this.context.store.dispatch(updateCellSource(this.props.id, text));
    }
  }

  onFocusChange(focused: boolean): void {
    const { cellFocused } = this.props;
    if (focused) {
      this.context.store.dispatch(focusCellEditor(this.props.id));
      if (!cellFocused) {
        this.context.store.dispatch(focusCell(this.props.id));
      }
    }
  }

  completions(editor: Object, callback: Function): void {
    if (!this.props.completion) {
      return;
    }

    const state = this.context.store.getState();
    const channels = state.app.channels;

    codeComplete(channels, editor)
      .subscribe(callback);
  }

  tabToSpaces(editor: Object): void {
    if (editor.somethingSelected()) {
      editor.indentSelection('add');
    } else {
      editor.replaceSelection(editor.getOption('indentWithTabs') ? '\t' :
        Array(this.props.tabSize + 1).join(' '), 'end', '+input');
    }
  }

  render(): ?React.Element<any> {
    const options = {
      autoCloseBrackets: this.props.autoCloseBrackets,
      mode: this.props.language,
      lineNumbers: this.props.lineNumbers,
      lineWrapping: this.props.lineWrapping,
      matchBrackets: this.props.matchBrackets,
      theme: this.props.cmtheme,
      cursorBlinkRate: this.props.cursorBlinkRate,
      autofocus: false,
      hintOptions: {
        hint: this.hint,
        completeSingle: false, // In automatic autocomplete mode we don't want override
        extraKeys: {
          Right: pick,
        },
      },
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        Tab: this.tabToSpaces,
        'Cmd-/': 'toggleComment',
        'Ctrl-/': 'toggleComment',
      },
      indentUnit: this.props.tabSize,
      tabSize: this.props.tabSize,
    };
    return (
      <div className="input">
        <CodeMirror
          value={this.state.source}
          ref={(el) => { this.codemirror = el; }}
          className="cell_cm"
          options={options}
          onChange={this.onChange}
          onFocusChange={this.onFocusChange}
          onClick={() => this.focus()}
        />
      </div>
    );
  }
}
