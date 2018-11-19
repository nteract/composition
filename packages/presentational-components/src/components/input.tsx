import * as React from "react";

interface InputProps {
  children: React.ReactNode,
  /**
   * Whether or not to render the children.
   */
  hidden: boolean
};

export class Input extends React.Component<InputProps> {
  static defaultProps = {
    children: null,
    hidden: false
  };

  render() {
    if (this.props.hidden) {
      return null;
    }

    return (
      <div className="input-container">
        {this.props.children}
        <style jsx>{`
          .input-container {
            display: flex;
            flex-direction: row;
          }

          .input-container.invisible {
            height: 34px;
          }

          .input-container :global(.prompt) {
            flex: 0 0 auto;
          }

          .input-container :global(.input) {
            flex: 1 1 auto;
            overflow: auto;
            background-color: var(--theme-cell-input-bg, #fafafa);
          }
        `}</style>
      </div>
    );
  }
}
