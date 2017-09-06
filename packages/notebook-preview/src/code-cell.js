// @flow
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";
import { Display } from "@nteract/display-area";

import Inputs from "./inputs";

import Editor from "./editor";

import LatexRenderer from "./latex";

type Props = {
  cell: ImmutableMap<string, any>,
  displayOrder: Array<string>,
  id: string,
  language: string,
  theme: string,
  tip: boolean,
  transforms: Object,
  running: boolean,
  models: ImmutableMap<string, any>,
  sourceHidden: boolean
};

type PapermillMetadata = {
  status?: "pending" | "running" | "completed"
  // TODO: Acknowledge / use other papermill metadata
};

const PapermillView = (props: PapermillMetadata) => {
  if (!props.status) {
    return null;
  }

  if (props.status === "running") {
    return (
      <div
        style={{
          width: "100%",
          backgroundColor: "#e8f2ff",
          paddingLeft: "10px",
          paddingTop: "1em",
          paddingBottom: "1em",
          paddingRight: "0",
          marginRight: "0",
          boxSizing: "border-box"
        }}
      >
        Executing with Papermill...
      </div>
    );
  }

  return null;
};

class CodeCell extends React.PureComponent<Props> {
  static defaultProps = {
    running: false,
    tabSize: 4,
    models: new ImmutableMap()
  };

  isOutputHidden(): any {
    return this.props.cell.getIn(["metadata", "outputHidden"]);
  }

  isInputHidden(): any {
    return (
      this.props.sourceHidden ||
      this.props.cell.getIn(["metadata", "inputHidden"]) ||
      this.props.cell.getIn(["metadata", "hide_input"])
    );
  }

  isOutputExpanded() {
    return this.props.cell.getIn(["metadata", "outputExpanded"], true);
  }

  render(): ?React$Element<any> {
    return (
      <div className={this.props && this.props.running ? "cell-running" : ""}>
        <PapermillView
          {...this.props.cell
            .getIn(["metadata", "papermill"], ImmutableMap())
            .toJS()}
        />
        {!this.isInputHidden() ? (
          <div className="input-container">
            <Inputs
              executionCount={this.props.cell.get("execution_count")}
              running={this.props.running}
            />
            <Editor
              completion
              id={this.props.id}
              input={this.props.cell.get("source")}
              language={this.props.language}
              theme={this.props.theme}
              tip={this.props.tip}
              cellFocused={false}
              onChange={() => {}}
              onFocusChange={() => {}}
              channels={{}}
              cursorBlinkRate={0}
              executionState={"not connected"}
              editorFocused={false}
              focusAbove={() => {}}
              focusBelow={() => {}}
            />
          </div>
        ) : null}
        <LatexRenderer>
          <div className="outputs">
            <Display
              className="outputs-display"
              outputs={this.props.cell.get("outputs").toJS()}
              displayOrder={this.props.displayOrder}
              transforms={this.props.transforms}
              theme={this.props.theme}
              tip={this.props.tip}
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
