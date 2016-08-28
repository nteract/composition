import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { TogglableDisplay } from 'react-jupyter-display-area';
import Immutable from 'immutable';

import Inputs from './inputs';

import Editor from './editor';
import LatexRenderer from '../latex';
import WidgetArea from './widget-area';

import Pager from './pager';

class CodeCell extends React.Component {
  static propTypes = {
    cell: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    displayOrder: React.PropTypes.instanceOf(Immutable.List).isRequired,
    cellStatus: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    getCompletions: React.PropTypes.func,
    id: React.PropTypes.string,
    language: React.PropTypes.string,
    theme: React.PropTypes.string,
    transforms: React.PropTypes.instanceOf(Immutable.Map),
    focused: React.PropTypes.bool,
    pagers: React.PropTypes.instanceOf(Immutable.List),
    running: React.PropTypes.bool,
    focusAbove: React.PropTypes.func,
    focusBelow: React.PropTypes.func,
    widgets: React.PropTypes.instanceOf(Immutable.List),
    widgetManager: React.PropTypes.any,
  };

  static defaultProps = {
    pagers: new Immutable.List(),
    running: false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  isOutputHidden() {
    return this.props.cellStatus.get('outputHidden');
  }

  isInputHidden() {
    return this.props.cellStatus.get('inputHidden');
  }

  render() {
    return (<div>
      {
        !this.isInputHidden() ?
          <div className="input-container">
            <Inputs
              executionCount={this.props.cell.get('execution_count')}
              running={this.props.running}
            />
            <Editor
              id={this.props.id}
              input={this.props.cell.get('source')}
              language={this.props.language}
              focused={this.props.focused}
              getCompletions={this.props.getCompletions}
              theme={this.props.theme}
              focusAbove={this.props.focusAbove}
              focusBelow={this.props.focusBelow}
            />
          </div> : null
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
                pager={pager}
                key={key}
              />
            )
          }
          </div> : null
      }
      {
        this.props.widgets && !this.props.widgets.isEmpty() ?
          <WidgetArea
            id={this.props.id}
            widgets={this.props.widgets}
            widgetManager={this.props.widgetManager}
          /> : null
      }
      <LatexRenderer>
        <div className="outputs">
          <TogglableDisplay
            className="outputs-display"
            outputs={this.props.cell.get('outputs')}
            isHidden={this.isOutputHidden()}
            displayOrder={this.props.displayOrder}
            transforms={this.props.transforms}
          />
        </div>
      </LatexRenderer>
    </div>);
  }
}

export default CodeCell;
