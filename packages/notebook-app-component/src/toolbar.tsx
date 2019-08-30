import { CellCommands, CellTarget } from "@nteract/commands";
import * as React from "react";
import styled, { StyledComponent } from "styled-components";

interface CellToolbarFrameProps {
  isShown: boolean;
}

export interface CellToolbarProps extends CellTarget {
  isSourceHidden: boolean;
  isCellFocused: boolean;
}

export const CellToolbarFrame:
  StyledComponent<"div", any, CellToolbarFrameProps, never> =
    styled.div.attrs<CellToolbarFrameProps>(
      ({ isShown }) => ({ style: isShown ? {} : { display:  "none" } })
    )`
  color: var(--theme-cell-toolbar-fg);
  background-color: var(--theme-cell-toolbar-bg);
  
  /* be on the top-right; keep visible when large code cells need scrolling */ 
  z-index: 9;
  float: right;
  position: sticky;
  top: 0; right: 0;
  
  /* allow the cell to completely overlap (underlap?) */
  margin: 0 0 0 -100%;

  /* be unobstrusive unless hovered */
  opacity: 0.4; :hover { opacity: 1 }
  transition: opacity 0.4s;

  /* UI elements are generally useless on paper */
  @media print {
    display: none;
  }
  
  /* arrange buttons in a row */
  display: flex;
  flex-direction: row;
  
  /* TODO: not sure this belongs here... */
  & button {
    &.icon {
      width: 22px;
      height: 20px;
      padding: 0 4px;
  
      text-align: center;
    }
    
    color: inherit;
    background: none;
    
    border: none;
    outline: none;
    
    transition: color 0.5s;
  }
`;

CellToolbarFrame.displayName = "CellToolbarFrame";

export const CellToolbar =
  (props: CellToolbarProps) =>
    <CellToolbarFrame isShown={props.isCellFocused || props.isSourceHidden}>
      <CellCommands target={props} location="toolbar"/>
      <CellCommands target={props} location="toolbar-dropdown" dropdown/>
      <CellCommands target={props} location="toolbar-end"/>
    </CellToolbarFrame>;

CellToolbar.displayName = "CellToolbar";
