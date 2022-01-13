import React, { FC, HTMLAttributes, useState } from "react";
import { connect } from "react-redux";
import { getLanguage} from "../util/helpers"
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder, faFileAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { generate } from 'shortid';
import {
  appendNotificationLog,
  appendConsoleLog,
  setFilePath,
  setLang
} from "../redux/actions"


const folderIcon = <FontAwesomeIcon icon={faFolder} style={{ fontSize: "14px", opacity: "0.6", marginRight: "8px" }} />
  const fileIcon = <FontAwesomeIcon icon={faFileAlt} style={{ fontSize: "14px", opacity: "0.6", marginRight: "8px" }} />
  const arrowIcon = <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "10px", opacity: "0.6", marginRight: "6px", marginLeft: "-13px", verticalAlign: "middle", marginTop: "-4px" }} />
  const arrowDownIcon = <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "10px", opacity: "0.6", marginRight: "6px", marginLeft: "-13px", verticalAlign: "middle", marginTop: "-4px", transform: "rotate(90deg)" }} />

  // STYLED ITEMS

  const UL = styled.ul`
  list-style: none;
  margin: 0px;
  padding: 0px;
  padding-left: 20px;
  font-family: Roboto;
  font-size: 14px;

  li {
    min-height: 25px;
    line-height: 25px;
    margin-top: 3px;
    cursor: pointer;
    opacity: 0.8;

    &:hover{
        opacity: 1;
        font-weight: 400;
    }
  }
`

// Props Interface



export interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  fileName: string,
  path: string,
  fileType: string
  folderLoading: (filePath: string) => Promise<string[][]>
  fileLoading: (filePath: string) => void,
}


const Item = React.memo((props: ItemProps) => {
  let item
  if (props.fileType === "dir") {
    const [data, setData] = useState([[""]])
    const [showSub, setSubfiles] = useState(false)
    // Folder
    item = (
      <>
        <li
          role="listitem"
          onClick={() => {
            if (data[0][0] === "") {
              props.folderLoading(props.path).then((data) => {
                setData(data)
          })
          }
          setSubfiles(!showSub)
          }}>
          {!showSub && arrowIcon}
          {showSub && arrowDownIcon}

          {folderIcon} {props.fileName}
        </li>
        {
          showSub &&
            <List data={data} fileLoading={props.fileLoading} folderLoading={props.folderLoading} />
        }
      </>
    )
  }
  // File
  else {
    item = <li role="listItem" onClick={() => { props.fileLoading(props.path) }}> {fileIcon} {props.fileName} </li>
  }
  return (
    <>
      {item}
    </>
  );
})


export interface ListProps extends HTMLAttributes<HTMLDivElement> {
  data: string[][],
  folderLoading: (filePath: string) => Promise<string[][]>,
  fileLoading: (filePath: string) => void,
}

const List = (props: ListProps) => {
  if (props.data[0][0] !== "") {
    const items = props.data.map((item) =>
      <Item key={generate()} fileName={item[0]} path={item[1]} fileType={item[2]} fileLoading={props.fileLoading} folderLoading={props.folderLoading} />
    );
    return (
      <>
        <UL role="list">
          {items}
        </UL>
      </>
    )
  }

  return (
    <>
    </>
  )
}

export interface Props extends HTMLAttributes<HTMLDivElement> {
  data: string[][],
  folderLoading: (filePath: string) => Promise<string[][]>
  setFilePath: (val:string)=> {}
}


const FE: FC<Props> = (props: Props) => {
  return (
    <>
      <List data={props.data} fileLoading={props.setFilePath} folderLoading={props.folderLoading} />
    </>
  );
}


const mapStateToProps = () => ({
})

const mapDispatchToProps = {
  appendNotificationLog: appendNotificationLog,
  appendConsoleLog: appendConsoleLog,
  setFilePath: setFilePath,
}


export default connect(mapStateToProps, mapDispatchToProps)(FE)
