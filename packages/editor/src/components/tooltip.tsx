import { Media, RichMedia } from "@nteract/outputs";
import { EditorFromTextArea } from "codemirror";
import * as React from "react";
import * as ReactDOM from "react-dom";
import styled, { StyledComponent } from "styled-components";
const TipButton: StyledComponent<"button", never> = styled.button`
  float: right;
  display: inline-block;
  position: absolute;
  top: 0px;
  right: 0px;
  font-size: 11.5px;
`;

const Tip: StyledComponent<"div", never> = styled.div`
  position: absolute;
  padding: 20px 20px 50px 20px;
  margin: 30px 20px 50px 20px;
  box-shadow: 2px 2px 50px rgba(0, 0, 0, 0.2);
  white-space: pre-wrap;
  background-color: var(--theme-app-bg);
  z-index: 9999999;
`;

export interface ToolTipProps {
  editor: EditorFromTextArea;
  toolTipRef: React.RefObject<HTMLDivElement>;
  bundle: any;
  deleteTip: () => void;
}

export interface ToolTipState {}

export class ToolTip extends React.PureComponent<ToolTipProps, ToolTipState> {
  mountToolTip = () => {
    const { editor } = this.props;
    const tipElement = this.props.toolTipRef.current;
    const body: HTMLElement = document.body;

    if (tipElement != null && body != null) {
      const rowNum = editor.getDoc().getCursor().line;
      editor.addWidget({ line: rowNum, ch: 0 }, tipElement, true);

      const pos: ClientRect | DOMRect = tipElement.getBoundingClientRect();
      body.appendChild(tipElement);
      tipElement.style.top = `${pos.top}px`;
    }
  };
  componentDidMount = () => {
    this.mountToolTip();
  };
  componentDidUpdate = () => {
    this.mountToolTip();
  };

  render() {
    const expanded: { expanded: boolean } = { expanded: true };
    const { bundle, toolTipRef, deleteTip } = this.props;
    const tipElement = toolTipRef.current;
    return tipElement && bundle
      ? ReactDOM.createPortal(
          <Tip className="CodeMirror-hint">
            <RichMedia data={bundle} metadata={{ expanded }}>
              <Media.Plain />
            </RichMedia>
            <TipButton onClick={deleteTip}>{"\u2715"}</TipButton>
          </Tip>,
          tipElement
        )
      : null;
  }
}
