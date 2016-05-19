import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Immutable from 'immutable';
import Widget from './widget';

class WidgetArea extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    widgets: React.PropTypes.instanceOf(Immutable.List),
    widgetManager: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    return (<div className="cell-widget-area">
      {this.props.widgets.map((widgetId, index) =>
        <Widget
          id={widgetId}
          key={`index: ${index}, widgetId: ${widgetId}`}
          cellId={this.props.id}
          widgetManager={this.props.widgetManager}
        />
      )}
    </div>);
  }
}

export default WidgetArea;
