import * as React from "react";
import styled from "styled-components";


const ConsoleDiv = styled.div`
  clear: left;
  height: 200px;
  padding: 15px;
  color: #f1f1f1;
  font-family: Monaco, monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #2d2424;
  overflow: auto;
  counter-reset: line-numbering;
  margin-top: 0;
  border-top: 1px solid #000;
`;

export default class Console extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
      return (
        <ConsoleDiv>  
                Console
        </ConsoleDiv>    
      );
    }
  } 
