import { createWrapper } from "next-redux-wrapper";
import App from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureStore from "../redux/store";

/**
 * Next.JS requires all global CSS to be imported here.
 */
import "@nteract/styles/app.css";

import "@nteract/styles/global-variables.css";

import "@nteract/styles/themes/base.css";
import "@nteract/styles/themes/default.css";

import "codemirror/addon/hint/show-hint.css";
import "codemirror/lib/codemirror.css";

import "@nteract/styles/editor-overrides.css";

import "@nteract/styles/markdown/github.css";

interface StoreProps {
  store: Store;
}

class WebApp extends App<StoreProps> {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (<Component {...pageProps} />);
  }
}

const wrapper = createWrapper(configureStore, { debug: true });

export default wrapper.withRedux(WebApp);
