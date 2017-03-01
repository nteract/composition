// @flow
import React from 'react';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { Display } from '@nteract/display-area';

import Inputs from './inputs';

import Editor from './editor';

import LatexRenderer from './latex';

type Props = {
  cell: ImmutableMap<string, any>,
  displayOrder: ImmutableList<any>,
  id: string,
  language: string,
  theme: string,
  transforms: ImmutableMap<string, any>,
  running: boolean,
  models: ImmutableMap<string, any>,
};

class CodeCell extends React.PureComponent {
  props: Props;

  static defaultProps = {
    running: false,
    tabSize: 4,
    models: new ImmutableMap(),
  };

  isOutputHidden(): any {
    return this.props.cell.getIn(['metadata', 'outputHidden']);
  }

  isInputHidden(): any {
    return this.props.cell.getIn(['metadata', 'inputHidden']);
  }

  isOutputExpanded() {
    return this.props.cell.getIn(['metadata', 'outputExpanded']);
  }

  render(): ?React.Element<any> {
    return (<div className={this.props && this.props.running ? 'cell-running' : ''} >
      {
        !this.isInputHidden() ?
          <div className="input-container">
            <Inputs
              executionCount={this.props.cell.get('execution_count')}
              running={this.props.running}
            />
            <Editor
              completion
              id={this.props.id}
              input={this.props.cell.get('source')}
              language={this.props.language}
              theme={this.props.theme}
              cellFocused={false}
              onChange={() => {}}
              onFocusChange={() => {}}
              channels={{}}
              cursorBlinkRate={0}
              executionState={'not connected'}
              editorFocused={false}
              focusAbove={() => {}}
              focusBelow={() => {}}
            />
          </div> : <div className="input-container invisible" />
      }
      <LatexRenderer>
        <div className="outputs">
          <Display
            className="outputs-display"
            outputs={this.props.cell.get('outputs')}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
            theme={this.props.theme}
            expanded={this.isOutputExpanded()}
            isHidden={this.isOutputHidden()}
            models={this.props.models}
          />
        </div>
      </LatexRenderer>
    </div>);
  }
}

export default CodeCell;
