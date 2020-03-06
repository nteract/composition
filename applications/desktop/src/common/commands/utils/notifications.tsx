import { Breadcrumbs } from "@blueprintjs/core";
import { shell } from "electron";
import React from "react";
import styled from "styled-components";

const Spacer = styled.div`
  height: 30px;
`;

const NoWrap = styled.div`
  white-space: nowrap;
  position: absolute;
  width: 250px;
  
  * { 
    font-size: 14px !important;
    background: transparent !important;
  }
  
  li::after { margin: 0 3px !important; }
`;

// Show the user the most important parts of the file path, as much as
// they have space in the message.
export const FilePathMessage = (props: { filepath: string }) =>
  <>
    <NoWrap>
      <Breadcrumbs items={props.filepath.split("/").map((each, i) => ({
        text: each,
        icon: i === props.filepath.split("/").length - 1
          ? "document"
          : "folder-close",
        onClick: i === props.filepath.split("/").length - 1
          ? () => shell.openItem(props.filepath)
          : undefined
      }))}/>
    </NoWrap>
    <Spacer/>
  </>;
