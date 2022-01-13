import React, { FC } from "react";
import BinderMenu from "../components/BinderMenu"
import { P, Box, Logo } from "../components/Basic"
import Head from "next/head";

const customStyle = {
  height: "150px",
  width: "1050px",
  background: "#f5f2f7",
  border: "1px solid #e6e0ea",
  marginTop: "120px",
  borderRadius: "4px",
}

export const Main: FC<HTMLDivElement> = () => {
  function updateVCSInfo(e: React.FormEvent<HTMLFormElement>, provider: string | undefined, org: string | undefined, repo: string | undefined, gitRef: string | undefined) {
    e.preventDefault()
    const url = `${window.location.href}p?vcs=${provider}&org=${org}&repo=${repo}&ref=${gitRef}`
    window.open(url, "_self");
  }

  return (
    <>
      <Head>
        <title>nteract web: Run interactive code</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <Box>

        <Logo src="https://media.githubusercontent.com/media/nteract/logos/master/nteract_logo_cube_book/exports/images/png/nteract_logo_wide_clear_space_purple.png" alt="nteract logo" />

        <P>
          Welcome to <b>nteract web</b>. <br /><br />

          It&apos;s an interactive playground for users to connect to kernels hosted on <a href="https://mybinder.org/" title="Binder" >Binder</a> and run code samples against it. It allows you to run notebooks online quickly and share it with your audience/colleagues/students.
        </P>

        <BinderMenu
          callback={updateVCSInfo}
          style={customStyle}
        />


      </Box>
    </>
  );
}


export default Main
