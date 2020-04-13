import * as React from "react";

import styled from "styled-components";

type Props = {
    provider: string,
    org: string,
    repo: string,
    gitRef: string
    updateBinder: (x:string,y:string,z:string,a:string) => void
}

type State = {
    provider: string,
    org: string,
    repo: string,
    gitRef: string
}

const BinderMenuDiv = styled.div`
    border-bottom:1px solid #d1e3dd;
    padding:20px;
    display: flex;
    

    input,select{
        height:35px;
        margin-left: 20px;
        outline: none;
        background-color:#fff;
        border:1px solid #d1e3dd;
        border-radius: 3px;
        padding-left: 10px;
        padding-right: 10px;
    }

    .submit-button{
        background-color:#0e6ba8;
        color: #fff;
        height:33px;
        border-radius:3px;
        border:1px solid #0e6ba8;
        cursor:pointer;
    }

    .submit-button:hover{
        background-color:#0a2472;
        border:1px solid #0a2472;
    }

    .binder-logo {
    width: 60px;
    display: block;
  }

`;


export default class BinderMenu extends React.Component<Props,State> {
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            provider: this.props.provider,
            org: this.props.org,
            repo: this.props.repo,
            gitRef: this.props.gitRef
        }
    }

    handleChange(event){
        const value = event.target.value
        switch(event.target.name){
            case "provider":
                this.setState({provider: value})
            break;
            case "org":
                this.setState({org: value})
            break;
            case "repo":
                this.setState({repo: value})
            break;
            case "gitRef":
                this.setState({gitRef: value})
            break;
        }
    }

    render() {
      return (
        <BinderMenuDiv>  
            <img
            className="binder-logo"
            src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0"
          />
            <form 
                onSubmit={() => this.props.updateBinder(
                    this.state.provider,
                    this.state.org,
                    this.state.repo,
                    this.state.gitRef
                )} >
                <select defaultValue={this.state.provider} 
                        name="provider" 
                        onChange={this.handleChange}>
                    <option value="gh">Github</option>
                </select>
                <input 
                    placeholder="Organization/username" 
                    value={this.state.org}
                    name="org"
                    onChange={this.handleChange}
                    />
                <input 
                    placeholder="Repository"
                    value={this.state.repo} 
                    name="repo"
                    onChange={this.handleChange}
                    />
                <input 
                    placeholder="Branch"
                    value={this.state.gitRef}
                    name="gitRef"
                    onChange={this.handleChange} 
                    />
                <input 
                    type="submit" 
                    className="submit-button" value="Launch"/>
            </form>
        </BinderMenuDiv>    
      );
    }
  } 
