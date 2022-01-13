import React, { FC, HTMLAttributes, useEffect } from "react";
import { State } from "../redux/store"
import { connect } from "react-redux";
import styled from "styled-components";
import { Button } from '../components/Button'
import { githubIcon } from "../util/icons"
import { 
  appendConsoleLog,
  appendNotificationLog,

  updateLoggedIn,
  updateUsername,
  updateUserImage,
  updateUserLink,

} from "../redux/actions"



const Box = styled.div<Props>`
  display: flex;
  font-family: roboto;

  a {
    text-decoration: none;
    color: inherit;
  }
`;

const Username = styled.div<Props>`
 height: 35px;
 line-height: 35px;
 margin-right: 10px;
 font-weight: bold;
 color: #545454;

 &:hover{
  color: #000;
 }
`;

const Img = styled.img<Props>`
  width: 35px;
  height: 35px;
  border-radius: 25px;
  background-color: #EBD8D8;
`;

export interface Props extends HTMLAttributes<HTMLDivElement> {
  userImage?: string,
  username?: string,
  userLink?: string,
  loggedIn?: boolean,

  appendConsoleLog?: (val:object) => {}
  appendNotificationLog?: (val:object) => {}

  updateLoggedIn?: (val: boolean) => {}
  updateUsername?: (val:string) => {}
  updateUserImage?: (val:string) => {}
  updateUserLink?: (val:string) => {}


  children?: React.ReactNode
}

 const Avatar: FC<Props> = (props: Props) => {

   useEffect(() => {
    // To check if Github token exist, if yes, get user details
    // Check if username is empty because we need to
    // get username only if it's not defined.
    if (localStorage.getItem("token") != undefined && props.username === "") {
        getGithubUserDetails()
    }
  }, [props.username])

   function OAuthGithub() {
    if (localStorage.getItem("token") == undefined) {
      window.open('https://github.com/login/oauth/authorize?client_id=83370967af4ee7984ea7&scope=repo,read:user&state=23DF32sdGc12e', '_blank');
      window.addEventListener('storage', getGithubUserDetails)
    }
  }

  function getGithubUserDetails() {
    const token = localStorage.getItem("token")
    fetch("https://api.github.com/user", {
      method: "GET",
      headers: new Headers({
        "Authorization": "token " + token
      })

    })
      .then((res) => res.json())
      .then((data) => {
        if (data["login"] !== undefined) {
          props.updateLoggedIn(true)
          props.updateUsername(data["login"])
          props.updateUserLink(data["html_url"])
          props.updateUserImage(data["avatar_url"])

        props.appendConsoleLog({
            type: "success",
            message: `Successfully logged into Github as @${data["login"]}`
          })

        } else {
          localStorage.removeItem("token")
          props.updateLoggedIn(false)
          let log = {
            type: "failure",
            message: `Github token expired. User logged out.`
          }
          props.appendConsoleLog(log)
          props.appendNotificationLog(log)

        }
      })
    window.removeEventListener("storage", getGithubUserDetails)
  }

  return (
    <>
    {props.loggedIn ?
    <Box >
      <Username >
        <a href={props.userLink}>
          @{props.username}
        </a>
      </Username>
      <Img src={props.userImage} />
    </Box>
              : <Button onClick={() => OAuthGithub()} text="Connect to Github" icon={githubIcon} />
            }
    </>
  );
}

Avatar.defaultProps = {
  username: "username",
  userImage: "https://api.adorable.io/avatars/61/abott@adorable.png",
  userLink: "#",
  loggedIn: false,
}

const mapStateToProps = (state: State) => ({
  loggedIn: state.global.loggedIn,
  username: state.global.username,
  userImage: state.global.userImage ,
  userLink: state.global.userLink,
})

const mapDispatchToProps = {
      appendConsoleLog: appendConsoleLog,
      appendNotificationLog: appendNotificationLog,

      updateLoggedIn: updateLoggedIn,
      updateUsername: updateUsername,
      updateUserImage: updateUserImage,
      updateUserLink: updateUserLink

}

export default connect(mapStateToProps, mapDispatchToProps)(Avatar)
