// @flow
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */

import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import Cell from "../components/cell/cell";

type Props = {|
  cell: ImmutableMap<string, any>,
  displayOrder: Array<string>,
  connectDragPreview: (img: Image) => void,
  connectDragSource: (el: ?React.Element<any>) => void,
  connectDropTarget: (el: ?React.Element<any>) => void,
  selectCell: () => void,
  id: string,
  isDragging: boolean,
  isOver: boolean,
  cellFocused: string,
  editorFocused: string,
  transforms: ImmutableMap<string, any>,
  language: string,
  running: boolean,
  theme: string,
  cursorBlinkRate: number,
  pagers: ImmutableList<any>,
  moveCell: (source: string, dest: string, above: boolean) => Object,
  models: ImmutableMap<string, any>
|};

type State = {|
  hoverUpperHalf: boolean
|};

const cellSource = {
  beginDrag(props: Props) {
    return {
      id: props.id
    };
  }
};

function isDragUpper(props: Props, monitor: Object, el: HTMLElement): boolean {
  const hoverBoundingRect = el.getBoundingClientRect();
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  const clientOffset = monitor.getClientOffset();
  const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  return hoverClientY < hoverMiddleY;
}

const cellTarget = {
  drop(props: Props, monitor: Object | void, component: any): void {
    if (monitor) {
      const hoverUpperHalf = isDragUpper(props, monitor, component.el);
      // DropTargetSpec monitor definition could be undefined. we'll need a check for monitor in order to pass validation.
      props.moveCell(monitor.getItem().id, props.id, hoverUpperHalf);
    }
  },

  hover(props: Props, monitor: Object | void, component: any): void {
    if (monitor) {
      component.setState({
        hoverUpperHalf: isDragUpper(props, monitor, component.el)
      });
    }
  }
};

function collectSource(connect: Object, monitor: Object): Object {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    connectDragPreview: connect.dragPreview()
  };
}

function collectTarget(connect: Object, monitor: Object): Object {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class DraggableCellView extends React.PureComponent {
  props: Props;
  state: State;

  el: HTMLElement;

  state = {
    hoverUpperHalf: true
  };

  componentDidMount(): void {
    const connectDragPreview = this.props.connectDragPreview;
    const img = new window.Image();

    img.src = [
      "data:image/png;base64,",
      "iVBORw0KGgoAAAANSUhEUgAAADsAAAAzCAYAAAApdnDeAAAAAXNSR0IArs4c6QAA",
      "AwNJREFUaAXtmlFL3EAUhe9MZptuoha3rLWgYC0W+lj/T3+26INvXbrI2oBdE9km",
      "O9Nzxu1S0LI70AQScyFmDDfkfvdMZpNwlCCccwq7f21MaVM4FPtkU0o59RdoJBMx",
      "WZINBg+DQWGKCAk+2kIKFh9JlSzLYVmOilEpR1Kh/iUbQFiNQTSbzWJrbYJximOJ",
      "cSaulpVRoqh4K8JhjprIVJWqFlCpQNG51roYj8cLjJcGf5RMZWC1TYw1o2LxcEmy",
      "0jeEo3ZFWVHIx0ji4eeKHFOx8l4sVVVZnBE6tWLHq7xO7FY86YpPeVjeo5y61tlR",
      "JyhXEOQhF/lw6BGWixHvUWXVTpdgyUMu8q1h/ZJbqQhdiLsESx4FLvL9gcV6q3Cs",
      "0liq2IHuBHjItYIV3rMvJnrYrkrdK9sr24EO9NO4AyI+i/CilOXbTi1xeXXFTyAS",
      "GSOfzs42XmM+v5fJ5JvP29/fl8PDw43nhCbUpuzFxYXs7OxKmqZb1WQGkc/P80K+",
      "T6dbnROaVJuyfPY+Pj7aup7h66HP/1Uu5O7u59bnhSTWpmxIEU3l9rBNdbrp6/TK",
      "Nt3xpq7XK9tUp5u+Tm2/s/jYJdfX12LwBHVycrKRK89zmeJhYnZ7K3Fcz3e/2mDP",
      "z7/waZEf8zaC+gSkKa3l4OBA3uztbXdOYFZtsKcfToNKSZNUPp6GnRN0AST3C1Ro",
      "x9qS3yvbFqVC6+yVDe1YW/J7ZduiVGidvbKhHWtLfq9sW5QKrdMri9cxB6OFhQmO",
      "TrDuBHjIRT5CEZZj0i7xOkYnWGeCPOQiHqC8lc/R60cLnNPuvjOkns7dk4t8/Jfv",
      "s46mRlWqQiudxebVV3gAj7C9hXsmgZeztnfe/91YODEr3IoF/JY/sE2gbGaVLci3",
      "hh0tRtWNvsm16JmNcOs6N9dW72LP7yOtWbEhjAUkZ+icoJ5HbE6+NSxMjKWe6cKb",
      "GkUWgMwiFbXSlRpFkXelUlF4F70rVd7Bd4oZ/LL8xiDmtPV2Nwyf2zOlTfHERY7i",
      "Haa1+w2+iFqx0aIgvgAAAABJRU5ErkJggg=="
    ].join("");
    img.onload = function dragImageLoaded() {
      connectDragPreview(img);
    };
  }

  render(): ?React.Element<any> {
    return this.props.connectDropTarget(
      <div
        style={{
          opacity: this.props.isDragging ? 0.25 : 1,
          borderTop:
            this.props.isOver && this.state.hoverUpperHalf
              ? "3px lightgray solid"
              : "3px transparent solid",
          borderBottom:
            this.props.isOver && !this.state.hoverUpperHalf
              ? "3px lightgray solid"
              : "3px transparent solid"
        }}
        className={"draggable-cell"}
        ref={el => {
          this.el = el;
        }}
      >
        {this.props.connectDragSource(
          <div
            className="cell-drag-handle"
            onClick={this.props.selectCell}
            role="presentation"
          />
        )}
        <div>
          <Cell
            cell={this.props.cell}
            displayOrder={this.props.displayOrder}
            id={this.props.id}
            cellFocused={this.props.cellFocused}
            editorFocused={this.props.editorFocused}
            language={this.props.language}
            running={this.props.running}
            theme={this.props.theme}
            cursorBlinkRate={this.props.cursorBlinkRate}
            pagers={this.props.pagers}
            transforms={this.props.transforms}
            models={this.props.models}
          />
        </div>
      </div>
    );
  }
}

type Source = DragSource<any, Props, State, DraggableCellView>;
type Target = DropTarget<any, Props, State, DraggableCellView>;

const source: Source = new DragSource("CELL", cellSource, collectSource);
const target: Target = new DropTarget("CELL", cellTarget, collectTarget);

export default source(target(DraggableCellView));
