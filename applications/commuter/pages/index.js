// @flow
import * as React from "react";
import Link from "next/link";

class IndexPage extends React.Component<*> {
  static async getInitialProps(ctx: Object) {
    if (ctx.res) {
      // Server side, do a redirect using the HTTP response object
      ctx.res.writeHead(302, { Location: "/view/" });
      ctx.res.end();
    } else {
      // Client side redirect
      document.location.pathname = "/view/";
    }
    return {};
  }

  render() {
    return (
      <React.Fragment>
        Redirecting to{" "}
        <Link href="/view">
          <a>/view</a>
        </Link>
      </React.Fragment>
    );
  }
}

export default IndexPage;
