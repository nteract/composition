import * as React from "react";

class BinderUI extends React.Component {
  render() {
    const {
      onFormSubmit,
      onGitrefChange,
      onRepoChange,
      repo,
      gitref
    } = this.props;
    return (
      <div className="binder-ui-wrapper">
        <div>
          <a className="anchor" href="https://mybinder.org" target="_blank">
            <img
              src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0"
              alt="binder logo"
              height="20px"
            />
          </a>
        </div>
        <div>
          <form onSubmit={onFormSubmit} className="form">
            <fieldset>
              <label htmlFor="repoInput">
                <span>GitHub Repo:</span>
                <input
                  id="repoInput"
                  onChange={onRepoChange}
                  type="text"
                  name="repo"
                  value={repo}
                  size="80"
                />
              </label>
            </fieldset>
            <fieldset>
              <label htmlFor="gitrefInput">
                <span>Branch/commit:</span>
                <input
                  id="gitrefInput"
                  onChange={onGitrefChange}
                  type="text"
                  name="gitref"
                  value={gitref}
                  size="80"
                />
              </label>
            </fieldset>
            <fieldset>
              <button type="submit">Build and Connect</button>
            </fieldset>
          </form>
        </div>
        <style jsx>{`
          img {
            vertical-align: middle;
            margin: 0 0 7px 10px;
          }

          input {
            font-family: inherit;
            font-size: inherit;
          }

          button {
            font-family: inherit;
            font-size: inherit;
            padding: 5px 10px 5px 10px;
            background-color: black;
            color: white;
            border: 1px solid white;
          }

          button:active {
            background-color: #1a1a1a;
            border: 1px solid #e7e7e7;
          }

          button:hover {
            background-color: #2a2a2a;
            border: 1px solid #d7d7d7;
          }

          fieldset {
            border: none;
          }

          label span {
            min-width: 10em;
            width: 10em;
            display: inline-block;
          }

          .binder-ui-wrapper {
            padding: 0px 0px 5px 10px;
          }
        `}</style>
      </div>
    );
  }
}
// TODO: Make a generic little console for some of the styled container pieces,
//       then make this component inject the binder specific bits
export class BinderConsole extends React.Component {
  render() {
    const { logs, ...otherprops } = this.props;
    return (
      <div className="binder-console">
        <BinderUI {...otherprops} />
        <div className="logs">
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
        </div>

        <style jsx>{`
          .log {
            padding: 0 15px 0 0px;
            margin: 0;
            min-height: 16px;
            display: block;
          }

          .logs {
            margin: 5px 0px 5px 0px;
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
            text-decoration: none;
            color: #666;
          }

          .binder-console {
            clear: left;
            min-height: 42px;
            padding: 15px 0px 15px 0;
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

          .log:last-child {
            background-color: #292929;
          }
        `}</style>
      </div>
    );
  }
}
