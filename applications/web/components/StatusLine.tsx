import * as React from "react";
import styled from "styled-components";

type Props = {
  toggleConsole: ()=>void
}

const StatusDiv = styled.div`
    height:30px;
    line-height:27px;
    background-color:#f4f4f4;
    padding: 0px 15px 0px 15px;
    border-top:1px solid #c4d1c2;
    font-size: 14px;

    .status-img{
      width:18px;
      vertical-align: middle;
    }
`;

export default class StatusLine extends React.Component<Props> {
    constructor(props){
        super(props);
    }
    render() {
      return (
        <StatusDiv>  
          <span onClick={()=>this.props.toggleConsole()}>Toggle Console</span> | 
          <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png"
          className="status-img"
          /> Python 3 | Idle
        </StatusDiv>    
      );
    }
  } 
