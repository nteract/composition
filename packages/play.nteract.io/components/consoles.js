import * as React from "react";

// TODO: Make a generic little console for some of the styled container pieces,
//       then make this component inject the binder specific bits
export class BinderConsole extends React.Component {
  render() {
    const { logs, onFormSubmit } = this.props;
    return (
      <div className="binder-console">
        <div className="binder-ui-wrapper">
          <a className="anchor" href="https://mybinder.org" target="_blank">
            <img
              src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0"
              alt="binder logo"
              height="20px"
            />
          </a>
          <form onSubmit={onFormSubmit} className="form">
            <p className="para">
              GitHub Repo:
              <input
                type="text"
                defaultValue="binder-examples/python2_with_3"
                name="repo"
              />
            </p>
            <p className="para">
              Branch/commit:
              <input type="text" defaultValue="master" name="ref" />
            </p>
            <button type="submit"> Submit</button>
          </form>
        </div>
        {logs.length > 0
          ? logs.map((log, index) => {
              return (
                <span className="log" key={index}>
                  <span className="sidebar" />
                  <span className="phase">{log.phase}</span>
                  <span className="content">
                    <span className="message">{log.message}</span>
                  </span>
                </span>
              );
            })
          : null}

        <style jsx>{`
          img {
            vertical-align: middle;
            padding: 0 0 20px 20px;
          }

          .log {
            padding: 0 15px 0 32px;
            margin: 0;
            min-height: 16px;
            display: block;
          }

          .phase {
            display: inline-block;
            min-width: 80px;
            padding-right: 10px;
            text-decoration: none;
            color: #888;
          }

          .sidebar::before {
            content: counter(line-numbering);
            counter-increment: line-numbering;
            padding-right: 1em;
          }

          .sidebar {
            display: inline-block;
            text-align: right;
            min-width: 40px;
            margin-left: -32px;
            text-decoration: none;
            color: #666;
          }

          .binder-console {
            clear: left;
            min-height: 42px;
            padding: 15px 0px 25px 0;
            color: #f1f1f1;
            font-family: Monaco, monospace;
            font-size: 12px;
            line-height: 19px;
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #1a1a1a;
            counter-reset: line-numbering;
            margin-top: 0;
          }

          .form {
            float: left;
          }

          .anchor {
            float: left;
          }

          .binder-ui-wrapper {
            display: inline-block;
          }

          .para {
            float: left;
          }

          .log:last-child {
            background-color: #292929;
          }
        `}</style>
      </div>
    );
  }
}
