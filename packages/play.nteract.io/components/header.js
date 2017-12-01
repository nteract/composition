import * as React from "react";

export class Header extends React.Component {
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
    return (
      <div>
        <div className="banner">
          <img
            src="https://media.githubusercontent.com/media/nteract/logos/master/nteract_logo_cube_book/exports/images/svg/nteract_logo_wide_purple_inverted.svg"
            height="20px"
            alt="nteract logo"
          />
          <div className="kernelInfo">
            <span className="kernel">Runtime: </span>
            {this.props.kernelStatus}
          </div>
        </div>

        <style jsx>{`
          .banner {
            user-select: none;
            font-family: Monaco, monospace;
            padding: 10px 0px 10px 20px;
            background-color: #1a1a1a;
            color: white;
            margin: 0 auto;
          }

          .kernel {
            color: #888;
          }

          .kernelInfo {
            float: right;
            padding-right: 20px;
            vertical-align: middle;

            color: #f1f1f1;
            font-family: Monaco, monospace;
            font-size: 12px;
            line-height: 19px;
            white-space: pre-wrap;
            word-wrap: break-word;
            background-color: #1a1a1a;
          }

          .banner img {
            vertical-align: middle;
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
