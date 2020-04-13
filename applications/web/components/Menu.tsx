import * as React from "react";

import styled from "styled-components";

type Props = {
  toggleBinderMenu: () => void,
  run:() => void
}

const MenuDiv = styled.div`
    height:50px;
    font-size:14px;
    border-bottom:1px solid #d1e3dd;
    background-color:#f4f4f4;

    button {
    padding: 0px 16px;
    border: none;
    outline: none;
    border-radius: unset;
    background-color: rgba(0, 0, 0, 0);
    cursor: pointer;
    height: 49px;
    line-height: 49px;
    font-family: Monaco, monospace;
    vertical-align: middle;
    outline:none;
  }

  button:active,
  button:focus {
    background-color: rgba(220,220,220,0.8);
    outline:none;
  }

  button:hover {
      background-color: rgba(220,220,220,0.8);
  }

  button:disabled {
  }
`;

export default class Menu extends React.Component<Props> {
    constructor(props){
        super(props);
    }
    render() {
      return (
        <MenuDiv>  
             <button
              className="play"
              onClick={() => this.props.run()}
            >
              ▶ Run
            </button>
            <button onClick={() => this.props.toggleBinderMenu()}>
              Binder Menu
            </button>
        </MenuDiv>    
      );
    }
  } 
