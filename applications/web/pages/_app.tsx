import { createWrapper } from "next-redux-wrapper";
import App from "next/app";
import React from "react";
import configureStore from "../redux/store";

/**
 * Next.JS requires all global CSS to be imported here.
 * Note: Do not change the order of css
 */
import "@nteract/styles/app.css";
import "@nteract/styles/global-variables.css";
import "@nteract/styles/sidebar.css";
import "@nteract/styles/themes/base.css";
import "@nteract/styles/themes/default.css";
import "@nteract/styles/toggle-switch.css";
import "@nteract/styles/toolbar.css";
import "@nteract/styles/cell-menu.css";
import "@nteract/styles/command-palette.css";

import "codemirror/addon/hint/show-hint.css";
import "codemirror/lib/codemirror.css";

import "@nteract/styles/editor-overrides.css";
import "@nteract/styles/markdown/github.css";


// Application wrapper by nextjs
class WebApp extends App {
  // Set initial props  
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx): {};

    // Anything returned here can be access by the client
    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Component {...pageProps} />);
  }
}

// wrapper with redux store
const wrapper = createWrapper(configureStore, { debug: true });

// Export app with wrapper
export default wrapper.withRedux(WebApp);
