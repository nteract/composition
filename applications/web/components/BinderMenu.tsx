import React, { FC, HTMLAttributes, useState } from "react";
import styled from "styled-components";
import { Button } from "./Button";
import { connect } from "react-redux";
import { State } from "../redux/store"
import { Input } from "./Input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from "@fortawesome/free-solid-svg-icons"
import { 
  appendNotificationLog,
  appendConsoleLog,
  setFilePath,
  resetFileBuffer,
  setProvider,
  setORG,
  setRepo,
  setGitRef,
} from "../redux/actions"


const rocketIcon = <FontAwesomeIcon icon={faRocket} />


const BinderMenuDiv = styled.div<Props>`
    border-bottom:0px solid #d1e3dd;
    padding:25px;
    display: flex;
    align-items: center;
    background-color: #fff;
    z-index:1000;

    form {
        display: flex;
    }

    input, select, button, label {
      margin-left: 25px;
    }


  .binder-logo {
    width: 80px;
    display: block;
  }

`;

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  provider: string;
  org: string;
  repo: string;
  gitRef: string;
  appendConsoleLog: (val:object) => {}
  appendNotificationLog: (val:object) => {}
  setProvider: (val:string) => {}
  setORG: (val:string) => {}
  setRepo: (val:string) => {}
  setGitRef: (val:string) => {}
  setFilePath: (val:string) => {}
  resetFileBuffer: () => {}
  callback?: (e: React.FormEvent<HTMLFormElement>, x: string | undefined, y: string | undefined, z: string | undefined, a: string | undefined) => void;
}



function useInput(val: string | undefined) {
  const [value, setValue] = useState(val);

  function handleChange(e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLSelectElement>) {
    setValue(e.currentTarget.value);
  }

  return {
    value,
    onChange: handleChange
  }
}


const BinderMenu: FC<Props> = (props: Props) => {
  const provider = useInput(props.provider)
  const org = useInput(props.org)
  const repo = useInput(props.repo)
  const gitRef = useInput(props.gitRef)

  function updateVCSInfo(event) {
    props.callback(event, provider.value, org.value, repo.value, gitRef.value)
    event.preventDefault()

      props.setProvider(provider.value)
      props.setORG(org.value)
      props.setRepo(repo.value)
      props.setGitRef(gitRef.value )
      props.setFilePath("")
      // To empty buffer when repo is updated
      props.resetFileBuffer()

      props.appendNotificationLog({
        type: "success",
        message: `Repo updated.`
      })

    props.appendConsoleLog({
        type: "success",
        message: `Repo updated: VCS=${provider} Owner=${org} repo=${repo} ref=${gitRef} file=`
      })

  }

  return (
    <>

      <BinderMenuDiv {...props}>

        <img className="binder-logo" alt="binder-logo" src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0" />
        <form onSubmit={(e) => updateVCSInfo(e)} >
          <div style={{ display: "flex", marginTop: "-25px" }} >
            <Input id="provider" variant="select" label="VCS"  {...provider} style={{ width: "120px" }}>
              <option value="gh">Github</option>
            </Input>
            <Input id="owner" label="Owner" {...org} />
            <Input id="repo" label="Repository" {...repo} />
            <Input id="branch" label="Branch" {...gitRef} />
          </div>
          <Button id="launch_button" text="Launch" style={{ marginLeft: '30px' }} icon={rocketIcon} />
        </form>
      </BinderMenuDiv>
    </>
  );
}

function defaultCallback(e: React.FormEvent<HTMLFormElement>, provider: string | undefined, org: string | undefined, repo: string | undefined, gitRef: string | undefined) {
    e.preventDefault()
}

// If we want to pass on the default values
BinderMenu.defaultProps = {
  provider: "gh",
  org: "nteract",
  repo: "examples",
  gitRef: "master",
  callback: defaultCallback
}

const mapStateToProps = (state: State) => ({
  provider: state.global.provider,
  org: state.global.org,
  repo: state.global.repo,
  gitRef: state.global.gitRef
})

const mapDispatchToProps = {
  appendNotificationLog: appendNotificationLog,
  appendConsoleLog: appendConsoleLog,
  setProvider: setProvider,
  setORG: setORG,
  setRepo: setRepo,
  setGitRef: setGitRef,
  resetFileBuffer: resetFileBuffer,
  setFilePath: setFilePath,

}


export default connect(mapStateToProps, mapDispatchToProps)(BinderMenu)
