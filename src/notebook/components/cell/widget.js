import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class Widget extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    cellId: React.PropTypes.string,
    widgetManager: React.PropTypes.any,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (this.refs.placeholder) {
      const placeholder = ReactDOM.findDOMNode(this.refs.placeholder);
      if (placeholder && placeholder.parentNode) {
        this.props.widgetManager.createViewForModel(
          this.props.id,
          this.props.cellId
        ).then(view => {
          try {
            placeholder.parentNode.replaceChild(view.el, placeholder);
            this.disposeView();
            this.view = view;
          } catch (err) {
            // NOMNOM
          }
        });
      }
    }
  }

  componentWillUnmount() {
    this.disposeView();
  }

  disposeView() {
    if (this.view) {
      // TODO: Clean-up on unmount
      delete this.view;
    }
  }

  render() {
    return (<div
      className={`widget-placeholder widget-${this.props.id}`}
      ref="placeholder"
    />);
  }
}
