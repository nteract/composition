// @flow
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import Inputs from './inputs';
import Display from './display-area';

import Editor from './editor';
import LatexRenderer from '../latex';

import Pager from './pager';

type Props = {
  cell: ImmutableMap<string, any>,
  displayOrder: ImmutableList<any>,
  id: string,
  language: string,
  theme: string,
  cursorBlinkRate: number,
  transforms: ImmutableMap<string, any>,
  cellFocused: boolean,
  editorFocused: boolean,
  pagers: ImmutableList<any>,
  running: boolean,
  focusAbove: Function,
  focusBelow: Function,
  tabSize: number,
};

class CodeCell extends React.Component {
  props: Props;
  shouldComponentUpdate: (p: Props, s: any) => boolean;

  static defaultProps = {
    pagers: new ImmutableList(),
    running: false,
    tabSize: 4,
  };

  constructor(): void {
    super();
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

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
              tabSize={this.props.tabSize}
              input={this.props.cell.get('source')}
              language={this.props.language}
              cellFocused={this.props.cellFocused}
              editorFocused={this.props.editorFocused}
              theme={this.props.theme}
              cursorBlinkRate={this.props.cursorBlinkRate}
              focusAbove={this.props.focusAbove}
              focusBelow={this.props.focusBelow}
            />
          </div> : <div className="input-container invisible" />
      }
      {
        this.props.pagers && !this.props.pagers.isEmpty() ?
          <div className="pagers">
            {
            this.props.pagers.map((pager, key) =>
              <Pager
                className="pager"
                displayOrder={this.props.displayOrder}
                transforms={this.props.transforms}
                bundle={pager.get('data')}
                theme={this.props.theme}
                key={key}
              />
            )
          }
          </div> : null
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
          />
        </div>
      </LatexRenderer>
    </div>);
  }
}

export default CodeCell;
