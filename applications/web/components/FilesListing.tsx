import React, { FC, HTMLAttributes, useState, useEffect } from "react";
import FileExplorer from "./FileExplorer"
import { connect } from "react-redux";
import { Octokit } from "@octokit/rest";
import { getContent } from "../util/github"
import { State } from "../redux/store"
import styled from "styled-components";
import { 
  appendNotificationLog,
  appendConsoleLog
} from "../redux/actions"


const Heading = styled.div`
  font-size: 13px;
  margin-top: 30px;
  font-weight: 500;
  opacity: 0.7;
`

const Body = styled.div`
  font-size: 14px;
  margin-top: 10px;
  margin-left: 5px;
`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  appendConsoleLog: (val:object) => {}
  appendNotificationLog: (val:object) => {}
  org: string,
  repo: string,
  gitRef: string

}


// TODO: Implement iterm.js here to connect with the termianl | This can be also done when working with jupyter server
const FilesListing: FC<Props> = (props: Props) => {

  // Folder Exploring Function
  async function getFiles(path: string) {
    const octokit = new Octokit()
    let fileList: string[][] = []

    await getContent(octokit, props.org, props.repo, props.gitRef, path).then((res) => {
      res.data.map((item: any) => {
        fileList.push([item.name, item.path, item.type])
      })
    }, (e: Error) => {
      fileList = [[""]]
      let log = {
        type: "failure",
        message: "Github repository not found."
      }
      props.appendConsoleLog(log)
      props.appendNotificationLog(log)
      console.log(e)
    })
    return fileList

  }


  const [data, setData] = useState([[""]])

  useEffect(() => {
    console.log("refreshed")
    getFiles("").then((newData: any) => {
      setData(newData)
    })
  }, [props.org, props.repo, props.gitRef])

  return (
    <>
      <Heading> {props.org}/{props.repo} [{props.gitRef}] </Heading>
      <Body>
        <FileExplorer data={data} folderLoading={getFiles} />
      </Body>
    </>
  );
}


const mapStateToProps = (state: State) => ({
  org: state.global.org,
  repo: state.global.repo,
  gitRef: state.global.gitRef
})

const mapDispatchToProps = {
  appendNotificationLog: appendNotificationLog,
  appendConsoleLog: appendConsoleLog
}


export default connect(mapStateToProps, mapDispatchToProps)(FilesListing)
