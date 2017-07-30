// @flow
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import Inputs from "./inputs";
import { Display } from "@nteract/display-area";

import Editor from "../../providers/editor";
import LatexRenderer from "../latex";

import Pager from "./pager";

type Props = {
  cell: ImmutableMap<string, any>,
  displayOrder: Array<string>,
  id: string,
  language: string,
  theme: string,
  transforms: Object,
  cellFocused: boolean,
  editorFocused: boolean,
  pagers: ImmutableList<any>,
  running: boolean,
  focusAbove: () => void,
  focusBelow: () => void,
  models: ImmutableMap<string, any>
};

class CodeCell extends React.PureComponent {
  props: Props;

  static defaultProps = {
    pagers: new ImmutableList(),
    running: false,
    tabSize: 4
  };

  isOutputHidden(): any {
    return this.props.cell.getIn(["metadata", "outputHidden"]);
  }

  isInputHidden(): any {
    return this.props.cell.getIn(["metadata", "inputHidden"]);
  }

  isOutputExpanded() {
    return this.props.cell.getIn(["metadata", "outputExpanded"]);
  }

  render(): ?React.Element<any> {
    return (
      <div className={this.props && this.props.running ? "cell-running" : ""}>
        {!this.isInputHidden()
          ? <div className="input-container">
              <Inputs
                executionCount={this.props.cell.get("execution_count")}
                running={this.props.running}
              />
              <Editor
                tip
                completion
                id={this.props.id}
                input={this.props.cell.get("source")}
                language={this.props.language}
                cellFocused={this.props.cellFocused}
                editorFocused={this.props.editorFocused}
                theme={this.props.theme}
                focusAbove={this.props.focusAbove}
                focusBelow={this.props.focusBelow}
              />
            </div>
          : <div className="input-container invisible" />}
        {this.props.pagers && !this.props.pagers.isEmpty()
          ? <div className="pagers">
              {this.props.pagers.map((pager, key) =>
                <Pager
                  expanded
                  className="pager"
                  displayOrder={this.props.displayOrder}
                  transforms={this.props.transforms}
                  bundle={pager.get("data")}
                  theme={this.props.theme}
                  key={key}
                />
              )}
            </div>
          : null}
        <LatexRenderer>
          <div className="outputs">
            <Display
              className="outputs-display"
              outputs={this.props.cell.get("outputs").toJS()}
              displayOrder={this.props.displayOrder}
              transforms={this.props.transforms}
              theme={this.props.theme}
              expanded={this.isOutputExpanded()}
              isHidden={this.isOutputHidden()}
              models={this.props.models.toJS()}
            />
          </div>
        </LatexRenderer>
      </div>
    );
  }
}

export default CodeCell;
