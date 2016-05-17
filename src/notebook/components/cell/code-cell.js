import React from 'react';

import Inputs from './inputs';

import Editor from './editor';
import Display from 'react-jupyter-display-area';
import LatexRenderer from '../latex';

import Pager from './pager';

import Immutable from 'immutable';

const CodeCell = (props) =>
  <div>
    <div className="input-container">
      <Inputs executionCount={props.cell.get('execution_count')} running={props.running} />
      <Editor
        id={props.id}
        input={props.cell.get('source')}
        language={props.language}
        focused={props.focused}
        getCompletions={props.getCompletions}
        theme={props.theme}
        focusAbove={props.focusAbove}
        focusBelow={props.focusBelow}
      />
    </div>
    {
      props.pagers && !props.pagers.isEmpty() ?
        <div className="pagers">
        {
          props.pagers.map((pager, key) =>
            <Pager
              className="pager"
              displayOrder={props.displayOrder}
              transforms={props.transforms}
              pager={pager}
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
          outputs={props.cell.get('outputs')}
          displayOrder={props.displayOrder}
          transforms={props.transforms}
        />
      </div>
    </LatexRenderer>
  </div>;

CodeCell.propTypes = {
  cell: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
  getCompletions: React.PropTypes.any,
  id: React.PropTypes.string,
  language: React.PropTypes.string,
  theme: React.PropTypes.string,
  transforms: React.PropTypes.instanceOf(Immutable.Map),
  focused: React.PropTypes.bool,
  pagers: React.PropTypes.instanceOf(Immutable.List),
  running: React.PropTypes.bool,
  focusAbove: React.PropTypes.func,
  focusBelow: React.PropTypes.func,
};

CodeCell.defaultProps = {
  pagers: new Immutable.List(),
  running: false,
};

export default CodeCell;
