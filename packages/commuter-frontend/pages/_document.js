// @flow
import * as React from "react";
import Document, { Head, Main, NextScript } from "next/document";

import flush from "styled-jsx/server";

import PropTypes from "prop-types";

class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const { html, head, errorHtml, chunks } = renderPage();
    const styles = flush();
    return { html, head, errorHtml, chunks, styles };
  }

  getChildContext() {
    return { _documentProps: this.props };
  }

  render() {
    return (
      <html lang="en-US">
        <Head>
          <link rel="stylesheet" type="text/css" href="/static/normalize.css" />
          <link rel="stylesheet" type="text/css" href="/static/nprogress.css" />

          <link rel="apple-touch-icon" href="/static/apple-touch-icon.png" />

          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/static/android-chrome-192x192.png"
          />

          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/static/favicon-32x32.png"
          />

          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/static/favicon-16x16.png"
          />

          <meta
            name="msapplication-TileImage"
            content="/static/mstile-150x150.png"
          />
          <link rel="shortcut icon" href="/static/favicon.ico" />

          <link
            href="https://fonts.googleapis.com/css?family=Source+Code+Pro:400,700,300,200,500,600,900"
            rel="stylesheet"
            type="text/css"
          />

          <link
            href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,200,200italic,300,300italic,400italic,600,600italic,700,700italic,900,900italic"
            rel="stylesheet"
            type="text/css"
          />
          <link rel="stylesheet" type="text/css" href="/static/commuter.css" />

          <script src="https://cdn.plot.ly/plotly-latest.min.js" />

          <script
            type="text/javascript"
            src="/static/mathjax-electron/resources/MathJax/MathJax.js?config=electron"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}

MyDocument.childContextTypes = {
  _documentProps: PropTypes.any
};

export default MyDocument;
