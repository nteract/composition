// @flow
import * as React from "react";

class BinderLogo extends React.Component<*, *> {
  render() {
    return (
      <React.Fragment>
        <a
          className="anchor"
          href="https://mybinder.org"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img
            src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0"
            alt="binder logo"
            height="20px"
          />
        </a>
        <style jsx>{`
          img {
            vertical-align: middle;
            margin: 0 0 7px 0px;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

class BinderTextInput extends React.Component<*, *> {
  render() {
    const { onChange, value, id, labelText, name } = this.props;

    return (
      <React.Fragment>
        <fieldset className="binder">
          <label htmlFor={id}>
            <span>{labelText}</span>
            <input
              id={id}
              onChange={onChange}
              type="text"
              name={name}
              value={value}
              size="80"
            />
          </label>
        </fieldset>
        <style jsx>{`
          input {
            font-family: inherit;
            font-size: inherit;
          }

          label span {
            width: 12em;
            display: inline-block;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

class BinderForm extends React.Component<*, *> {
  render() {
    const { onSubmit } = this.props;
    return (
      <React.Fragment>
        <form onSubmit={onSubmit} className="form">
          {this.props.children}
          <fieldset className="binder">
            <button type="submit">Build and Connect</button>
          </fieldset>
        </form>
        <style jsx>{`
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

          :global(fieldset.binder) {
            border: none;
            padding-left: 0px;
            margin-left: 0px;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

class BinderLogs extends React.Component<*, *> {
  render() {
    const { logs } = this.props;
    return (
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
            text-align: left;
            min-width: 20px;
            text-decoration: none;
            color: #666;
          }

          .log:last-child {
            background-color: #292929;
          }
        `}</style>
      </div>
    );
  }
}
// TODO: Make a generic little console for some of the styled container pieces,
//       then make this component inject the binder specific bits
export class BinderConsole extends React.Component<*, *> {
  render() {
    const {
      logs,
      onRepoChange,
      onGitrefChange,
      repo,
      gitref,
      onFormSubmit
    } = this.props;
    return (
      <div className="binder-console">
        <BinderLogo />
        <BinderForm onSubmit={onFormSubmit}>
          <BinderTextInput
            onChange={onRepoChange}
            id="repoInput"
            value={repo}
            labelText="Github Repo:"
            name="repo"
          />
          <BinderTextInput
            onChange={onGitrefChange}
            id="gitrefInput"
            name="gitref"
            value={gitref}
            labelText="Branch/commit/tag:"
          />
        </BinderForm>
        <BinderLogs logs={logs} />
        <style jsx>{`
          .binder-console {
            clear: left;
            min-height: 42px;
            padding: 15px 0px 20px 25px;
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
        `}</style>
      </div>
    );
  }
}
