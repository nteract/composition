import * as React from "react";

// TODO: Make a generic little console for some of the styled container pieces,
//       then make this component inject the binder specific bits
export class BinderConsole extends React.Component {
  constructor(props) {
    super(props);

    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.state = {
      expanded: props.expanded
    };
  }

  static defaultProps = {
    expanded: true
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.expanded !== this.props.expanded &&
      this.props.expanded !== this.state.expanded
    ) {
      this.setState({ expanded: this.props.expanded });
    }
  }

  toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    const { logs } = this.props;
    return (
      <div>
        <div
          className="banner"
          onClick={this.toggleExpanded}
          role="button"
          tabIndex="0"
          onKeyPress={this.toggleExpanded}
        >
          <img
            src="https://mybinder.org/static/logo.svg?v=f9f0d927b67cc9dc99d788c822ca21c0"
            alt="binder logo"
            height="20px"
          />
        </div>
        {this.state.expanded && logs.length > 0 ? (
          <div className="binder-console">
            {logs.map((log, index) => {
              return (
                <span className="log" key={index}>
                  <span className="sidebar" />
                  <span className="phase">{log.phase}</span>
                  <span className="content">
                    <span className="message">{log.message}</span>
                  </span>
                </span>
              );
            })}
          </div>
        ) : null}

        <style jsx>{`
          .banner {
            user-select: none;
            font-family: Monaco, monospace;
            padding: 10px 0px 10px 20px;
            background-color: #111;
            color: white;
            margin: 0 auto;
          }

          .banner img {
            vertical-align: middle;
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
            padding: 15px 0;
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
