// @flow
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

import CellCreatorButtons from './cell-creator-buttons';

type Props = {
    above: boolean,
    id: string,
};

type State = {
    show: boolean,
};

export default class CellCreator extends React.Component {
  props: Props;
  state: State;
  shouldComponentUpdate: (p: Props, s: State) => boolean;
  setHoverElement: (el: Object) => void;
  updateVisibility: (mouseEvent: Object) => void;
  hoverElement: Object;

  constructor(): void {
    super(...arguments);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.setHoverElement = this.setHoverElement.bind(this);
    this.updateVisibility = this.updateVisibility.bind(this);
  }

  state = {
    show: false,
  };

  componentDidMount(): void {
    // Listen to the page level mouse move event and manually check for
    // intersection because we don't want the hover region to actually capture
    // any mouse events.  The hover region is an invisible element that
    // describes the "hot region" that toggles the creator buttons.
    document.addEventListener('mousemove', this.updateVisibility, false);
  }

  componentWillUnmount(): void {
    document.removeEventListener('mousemove', this.updateVisibility);
  }

  setHoverElement(el: Object): void {
    this.hoverElement = el;
  }

  updateVisibility(mouseEvent: Object): void {
    if (this.hoverElement) {
      const x = mouseEvent.clientX;
      const y = mouseEvent.clientY;
      const regionRect = this.hoverElement.getBoundingClientRect();
      const show = (regionRect.left < x && x < regionRect.right) &&
                   (regionRect.top < y && y < regionRect.bottom);
      this.setState({ show });
    }
  }


  render(): ?React.Element<any> {
    return (
      <div className="creator-hover-mask">
        <div className="creator-hover-region" ref={this.setHoverElement}>
          {this.state.show || this.props.id === null ?
            (<CellCreatorButtons above={this.props.above} id={this.props.id} />) :
            ''}
        </div>
      </div>);
  }

}
