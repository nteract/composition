// @flow
import * as React from "react";
import Document, { Head, Main, NextScript } from "next/document";
import flush from "styled-jsx/server";
import PropTypes from "prop-types";

class MyDocument extends Document {
  static getInitialProps(context: Object) {
    const renderPage = context.renderPage;
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
        <Head />
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
