import React, { FC, HTMLAttributes, useEffect } from "react";
import { WithRouterProps } from "next/dist/client/with-router";
import { withRouter, useRouter, NextRouter } from "next/router";
import { connect } from "react-redux";
import { Octokit } from "@octokit/rest";
import { formatDistanceToNow } from "date-fns";
import { State, GlobalRecord } from "../../redux/store"
import dynamic from "next/dynamic";
import Immutable from "immutable";
// nteract
import { contentByRef } from "@nteract/selectors";
import { ContentRecord } from "@nteract/types";
import { Host } from "@mybinder/host-cache";
import { stringifyNotebook } from "@nteract/commutable";
const CodeMirrorEditor = dynamic(() => import('@nteract/editor'), { ssr: false });

// User defined
import { 
  toggleBinderMenu, 
  toggleConsole, 
  toggleSaveDialog,
  setFilePath,
  setFileContent,
  setProvider,
  setORG,
  setRepo,
  setGitRef,
  setLang,
  setCommitMessage,
  toggleStripOutput,
  resetFileBuffer,
  updateFileBuffer,
  setSavedTime,
  appendConsoleLog,
  appendNotificationLog,
  shiftNotificationLog,
  setServerStatus,
  setHost,
  updateLoggedIn,
  updateUsername,
  updateUserImage,
  updateUserLink,

} from "../../redux/actions"
import { Menu, MenuItem } from '../../components/Menu'
import { Button } from '../../components/Button'
import { Console } from '../../components/Console'
import { Notification } from '../../components/Notification'
import BinderMenu from '../../components/BinderMenu'
import Avatar from '../../components/Avatar'
import { Input } from '../../components/Input'
import { Dialog, Shadow, DialogRow, DialogFooter } from '../../components/Dialog';
import FilesListing from "../../components/FilesListing"
import { Layout, Header, Body, Side, Footer } from "../../components/Layout"
import { H3, P } from "../../components/Basic"
import NextHead from "../../components/Header";
import { getLanguage} from "../../util/helpers"
import { uploadToRepo, checkFork, getContent } from "../../util/github"
import { runIcon, saveIcon, menuIcon, consoleIcon, pythonIcon, serverIcon, commitIcon } from "../../util/icons"
const Binder = dynamic(() => import("../../components/Binder"), {
  ssr: false
});

const BINDER_URL = "https://mybinder.org";

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  router: NextRouter,
  toggleBinderMenu: () => {},
  toggleConsole: () => {},
  toggleSaveDialog: () => {}
  
  setFilePath: (val:string) => {}
  setFileContent: (val:string) => {}
  setProvider: (val:string) => {}
  setORG: (val:string) => {}
  setRepo: (val:string) => {}
  setGitRef: (val:string) => {}
  setLang: (val:string) => {}
  setCommitMessage: (val:string) => {}
  toggleStripOutput: () => {}
  resetFileBuffer: () => {}
  updateFileBuffer: (content: string, file:string) => {}
  setSavedTime: (val:object) => {}
  appendConsoleLog: (val:object) => {}
  appendNotificationLog: (val:object) => {}
  shiftNotificationLog: () => {}
  setServerStatus: (val:string) => {}
  setHost: (obj:object) => {}
  updateLoggedIn: (val: boolean) => {}
  updateUsername: (val:string) => {}
  updateUserImage: (val:string) => {}
  updateUserLink: (val:string) => {}

  contents: Immutable.Map<string, ContentRecord>,
  globalState: GlobalRecord

}


/**************************
 Main Component
**************************/
export const Main: FC<WithRouterProps> = (props: ComponentProps) => {
  const router = useRouter()
  /***************************************
    Notification and Console functions
  ****************************************/

  // Function to add logs to both notification and console
  const addLog = (log) => {
    props.appendConsoleLog(log)
    props.appendNotificationLog(log)
  }

  /******************
    Effect Hooks
   *****************/

  useEffect(() => {
    if (router.query.org != undefined ){
    props.setORG(router.query.org as string)
    }

    if (router.query.repo != undefined ){
    props.setRepo(router.query.repo as string)
    }


    if (router.query.ref != undefined ){
    props.setGitRef(router.query.ref as string)
    }

    if (router.query.vcs != undefined ){
    props.setProvider(router.query.vcs as string)
    }
    
  }, [props.globalState.provider])


  // To update file when filePath is updated
  // Also makes sure that filepath is not undefined
  // If it is undefined or empty, don't load the file
  // and set filePath to empty and not undefined
  useEffect(() => {
    if (router.query.file != undefined && props.globalState.filePath != "") {
      loadFile(props.globalState.filePath)
    } else {
      props.setFilePath("")
    }
  }, [props.globalState.filePath])

  // Remove notification after 3 seconds
  // We are removing the first element only, because
  // all the previous notifications has already
  // been removed by now
  useEffect(() => {
    const timer = setTimeout(() => {
      props.shiftNotificationLog()
    }, 3000);
    return () => clearTimeout(timer)
  }, [props.globalState.notificationLog])

  // When use update the binder menu, we also need to update the route and url
  useEffect(() => {
    router.push(`/p?vcs=${props.globalState.provider}&org=${props.globalState.org}&repo=${props.globalState.repo}&ref=${props.globalState.gitRef}&file=${props.globalState.filePath}`, undefined, { shallow: true })

  }, [props.globalState.provider, props.globalState.org, props.globalState.repo, props.globalState.gitRef, props.globalState.filePath])

  /*************************************************
    Other functions
  ************************************************/

  function run() {
    console.log("run binder here")
  }

  function showSave() {
    props.toggleSaveDialog()
  }



  // To save/upload data to github
  const onSave = async (event) => {
    event.preventDefault()
    addLog({
          type: "success",
          message: "Initiating save..."
    })
    props.toggleSaveDialog()

    props.contents.map(x => {
      const content = stringifyNotebook(x.model.get("notebook", undefined))
      props.updateFileBuffer(content, x.filepath)
    }
    )

    // Step 1: Check if buffer is empty
    if (Object.keys(props.globalState.fileBuffer).length == 0) {
      addLog({
        type: "failure",
        message: "Can't save changes, no file updated"
      })
      return
    }

    // Step 2: Get authentication of user
    const auth = localStorage.getItem("token")
    const octo = new Octokit({
      auth
    })

    // Step 3: Find fork or handle in case it doesn't exist.
    await checkFork(octo, props.globalState.org, props.globalState.repo, props.globalState.gitRef, props.globalState.username).then(() => {
      // Step 4: Since user is working on the fork or is owner of the repo
      props.setORG(props.globalState.username)
      // Step 5: Upload to the repo from buffer
      try {
        uploadToRepo(octo, props.globalState.username, props.globalState.repo, props.globalState.gitRef, props.globalState.fileBuffer, props.globalState.commitMessage).then(() => {
          // Step 6: Empty the buffer
          props.resetFileBuffer()
          addLog({
            type: "success",
            message: "Successfully saved!"
          })

          // Update time of save
          props.setSavedTime(new Date())
        })
      } catch (err) {
        addLog({
          type: "failure",
          message: "Error while saving changes."
        })

      }
    }).catch((e) => {
      addLog({
        type: "failure",
        message: "Github repository not found."
      })
    })



  }

  function loadFile(fileName) {
    let extension = fileName.split('.').pop()
    props.setFilePath(fileName)
    props.setLang(getLanguage(extension))

    if (extension != "ipynb") {
      if (fileName in props.globalState.fileBuffer) {
        props.setFileContent(props.globalState.fileBuffer[fileName])
      } else {
        const octokit = new Octokit()
        getContent(octokit, props.globalState.org, props.globalState.repo, props.globalState.gitRef, fileName).then(({ data }) => {
          props.setFileContent(atob(data["content"]))
        })
      }
    }

  }




  const addBinder = (ht) => {
    if (ht != props.globalState.host) {
      props.setServerStatus("Connected")
      props.setHost(ht)
      props.appendNotificationLog({
        type: "success",
        message: `Successfully connected to MyBinder`
      })

    props.appendConsoleLog({
        type: "success",
        message: `Successfully connected to MyBiner. \n\tServer running at ${ht.endpoint}?token=${ht.token}`
      })

    }

    // This is just to avoid not string return error
    return ""
  }

  const getNotebook = async (fileName) => {
    const octokit = new Octokit()
    const data = await getContent(octokit, props.globalState.org, props.globalState.repo, props.globalState.gitRef, fileName)
    return data
  }

  const dialogInputStyle = { width: "98%" }

  const generalEditor = (<CodeMirrorEditor
    editorFocused
    completion
    autofocus
    codeMirror={{
      lineNumbers: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-Enter": () => { },
        "Cmd-Enter": () => { }
      },
      cursorBlinkRate: 0,
      mode: props.globalState.lang
    }}
    preserveScrollPosition
    editorType="codemirror"
    onFocusChange={() => { }}
    focusAbove={() => { }}
    focusBelow={() => { }}
    kernelStatus={"not connected"}
    value={props.globalState.fileContent}
    onChange={(e) => {
      props.updateFileBuffer(e, props.globalState.filePath)
      props.setFileContent(e);
    }}
  />)

  const binderEditor = (
    <>
      <Binder getContent={getNotebook} filepath={props.globalState.filePath} host={props.globalState.host} />
    </>
  )

  const editor = props.globalState.lang == "ipynb" ? binderEditor : generalEditor;

  return (
    <Layout>
      <Host repo={`${props.globalState.org}/${props.globalState.repo}`} gitRef={props.globalState.gitRef} binderURL={BINDER_URL}>
        <Host.Consumer>
          { host =>
            host ? (
              <>
                {addBinder(host)}
              </>
            ) : "test"
          }
        </Host.Consumer>
      </Host>

      <NextHead />
      {
        props.globalState.showBinderMenu &&

        <BinderMenu
          style={{
            height: "150px",
            position: "absolute",
            marginTop: "49px",
            width: "calc(100% - 260px)",
            right: "0px",
            borderBottom: "1px solid #FBECEC",
          }}
        />
      }

      <Notification notifications={props.globalState.notificationLog} />

      {
        props.globalState.showConsole && <Console style={{
          position: "absolute",
          bottom: "30px",
          right: "0px",
          width: "calc(100% - 260px)"
        }} logs={props.globalState.consoleLog} />
      }


      {props.globalState.showSaveDialog &&
        <>
          <Shadow onClick={() => props.toggleSaveDialog()} />
          <Dialog >
            <form onSubmit={(e) => onSave(e)} >
              You are about to commit to <b>{props.globalState.org}/{props.globalState.repo}[{props.globalState.gitRef}]</b> as <b>@{props.globalState.username}</b>.
              <br /><br />
              If this repo doesn&apos;t already exist, it will automatically be created/forked. Enter your commit message here.
             <DialogRow>
               <Input id="commit_message" 
                      variant="textarea" 
                      label="Commit Message" 
                      onChange={(e: React.FormEvent<HTMLInputElement>)=> props.setCommitMessage(e.currentTarget.value)} 
                      value={props.globalState.commitMessage} 
                      style={dialogInputStyle} />
              </DialogRow>
              {false &&
                <DialogRow>
                  <Input  id="strip_output"
                          variant="checkbox" 
                          label="Strip the notebook output?" 
                          checked={props.globalState.stripOutput} 
                          onChange={ () => props.toggleStripOutput() } 
                          style={dialogInputStyle} />
                </DialogRow>
              }
              <DialogFooter>
                <Button id="commit_button" text="Commit" icon={commitIcon} />
              </DialogFooter>
            </form>
          </Dialog>
        </>
      }

      <Header>
        <Menu>
          <MenuItem>
            <Button text="Run" variant="outlined" icon={runIcon} onClick={() => run()} />
          </MenuItem>
          {props.globalState.loggedIn &&
            <MenuItem>
              <Button text="Save" variant="outlined" icon={saveIcon} onClick={() => showSave()} />
            </MenuItem>
          }

          <MenuItem>
            <Button text="Menu" variant="outlined" icon={menuIcon} onClick={() => props.toggleBinderMenu() } />
          </MenuItem>

        </Menu>
        <Menu>
          <MenuItem >
            <Avatar /> 
          </MenuItem>
        </Menu>
      </Header>
      <Side>
        <img
          src="https://media.githubusercontent.com/media/nteract/logos/master/nteract_logo_cube_book/exports/images/png/nteract_logo_wide_clear_space_purple.png"
          alt="nteract logo"
          className="logo"
        />
        <FilesListing/>
      </Side>
      <Body>

        {props.globalState.filePath && editor}

        {
          !props.globalState.filePath &&

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "180px" }}>

            <H3>Welcome to nteract web</H3>
            <P>
              nteract web is an awesome environment for you to reproduce a notebook project quickly and edit a notebook without installing additional software. It takes just a few seconds to get started.

              <ol>
                <li>Click on the menu above, and provide the path to the repository you want to reproduce. </li>
                <li>Use file explorer to open, run and edit files. </li>
                <li>Connect to GitHub to save back your changes. </li>
                <li>Share the above link to your network so they can reproduce your notebook. </li>
              </ol>
              Made with love by nteract contributors.
                      </P>

          </div>

        }
      </Body>

      <Footer>

        <Menu>
          <MenuItem>
            <Button text="Console" icon={consoleIcon} variant="transparent" onClick={() => props.toggleConsole()} />
          </MenuItem>
          <MenuItem>
            <Button text="Python 3" icon={pythonIcon} variant="transparent" disabled />
          </MenuItem>
          <MenuItem>
            <Button text={props.globalState.serverStatus} icon={serverIcon} variant="transparent" disabled />
          </MenuItem>
        </Menu>
        <Menu>
          <MenuItem>
            {formatDistanceToNow(props.globalState.savedTime as Date)}
          </MenuItem>
        </Menu>
      </Footer>
    </Layout>
  );
}



const mapStateToProps = (state: State) => ({
      contents: contentByRef(state),
      globalState: state.global
})

const mapDispatchToProps = {
      toggleBinderMenu: toggleBinderMenu,
      toggleConsole: toggleConsole,
      toggleSaveDialog: toggleSaveDialog,
      setFilePath: setFilePath,
      setFileContent: setFileContent,
      setProvider: setProvider,
      setORG: setORG,
      setRepo: setRepo,
      setGitRef: setGitRef,
      setLang: setLang,
      setCommitMessage: setCommitMessage,
      toggleStripOutput: toggleStripOutput,
      resetFileBuffer: resetFileBuffer,
      updateFileBuffer: updateFileBuffer,
      setSavedTime: setSavedTime,
      appendConsoleLog: appendConsoleLog,
      appendNotificationLog: appendNotificationLog,
      shiftNotificationLog: shiftNotificationLog,
      setServerStatus: setServerStatus,
      setHost: setHost,
      updateLoggedIn: updateLoggedIn,
      updateUsername: updateUsername,
      updateUserImage: updateUserImage,
      updateUserLink: updateUserLink
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Main))
