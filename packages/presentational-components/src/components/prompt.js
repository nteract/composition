// @flow
import * as React from "react";

/**
 * Generate what text goes inside the prompt based on the props to the prompt
 */
export function promptText(props: PromptProps): string {
  if (props.running) {
    return "[*]";
  }
  if (props.queued) {
    return "[…]";
  }
  if (typeof props.counter === "number") {
    return `[${props.counter}]`;
  }
  return "[ ]";
}

type PromptProps = {
  /**
   * Typically used to show what execution count the user is on. When working at
   * the `IPython` or `jupyter console` for example, it's the number between the
   * `[ ]`:
   *
   * ```
   * In [1]: 2 + 2
   * Out[1]: 4
   *
   * In [2]: "woohoo"
   * Out[2]: 'woohoo'
   * ```
   *
   */
  counter: ?number,
  /**
   * Show that execution is currently happening related to this prompt
   */
  running: boolean,
  /**
   * Show that execution is queued up
   */
  queued: boolean,
  /**
   * Create a prompt without the `[]`. Used with markdown cells.
   */
  blank: boolean
};

export class Prompt extends React.Component<PromptProps, null> {
  static defaultProps = {
    counter: null,
    running: false,
    queued: false,
    blank: false
  };

  render() {
    return (
      <React.Fragment>
        <div className="prompt">
          {this.props.blank ? null : promptText(this.props)}
        </div>
        <style jsx>{`
          .prompt {
            font-family: monospace;
            font-size: 12px;
            line-height: 22px;

            width: var(--prompt-width, 50px);
            padding: 9px 0;

            text-align: center;

            color: var(--theme-cell-prompt-fg, black);
            background-color: var(--theme-cell-prompt-bg, #fafafa);
          }
        `}</style>
      </React.Fragment>
    );
  }
}

export const PromptBuffer = () => <Prompt blank />;
