import { ContentRef } from "@nteract/types";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { StatusBar, StatusBarContext } from "@nteract/stateful-components";

interface ComponentProps {
  contentRef: ContentRef;
}

import styled from "styled-components";

export const LeftStatus = styled.div`
  float: left;
  display: block;
  padding-left: 10px;
`;
export const RightStatus = styled.div`
  float: right;
  padding-right: 10px;
  display: block;
`;

export const Bar = styled.div`
  padding-top: 8px;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  font-size: 16px;
  line-height: 0.5em;
  background: #22a6f1;
  color: #fff;
  z-index: 99;
  @media print {
    display: none;
  }
`;

export default class StyledStatusBar extends React.Component<ComponentProps> {
  render() {
    return (
      <StatusBar contentRef={this.props.contentRef}>
        <StatusBarContext.Consumer>
          {(context: any) => (
            <Bar>
              <RightStatus>
                {context.lastSaved ? (
                  <p>Last saved {formatDistanceToNow(context.lastSaved)}</p>
                ) : (
                  <p> Not saved yet </p>
                )}
              </RightStatus>
              <LeftStatus>
                <p>
                  {context.kernelSpecDisplayName || "Loading..."} |{" "}
                  {context.kernelStatus}
                </p>
              </LeftStatus>
            </Bar>
          )}
        </StatusBarContext.Consumer>
      </StatusBar>
    );
  }
}
