import * as React from "react";

interface OutputsProps {
  children: React.ReactNode[],
  /**
   * Whether or not to collapse the children of the component.
   */
  expanded: boolean,
  /**
   * Whether or not to show the children of the component.
   */
  hidden: boolean
};

export class Outputs extends React.Component<OutputsProps> {
  static defaultProps = {
    children: null,
    expanded: false,
    hidden: false
  };

  render() {
    if (this.props.hidden) {
      return null;
    }

    if (this.props.children) {
      return (
        <div className={`outputs${this.props.expanded ? " expanded" : ""}`}>
          {this.props.children}
          <style jsx>{`
            .outputs {
              padding: 10px 10px 10px calc(var(--prompt-width, 50px) + 10px);
              word-wrap: break-word;
              overflow-y: hidden;
              outline: none;
              /* When expanded, this is overtaken to 100% */
              max-height: 600px;
              text-overflow: ellipsis;
            }

            .expanded {
              max-height: 100%;
            }

            .outputs :global(a) {
              color: var(--link-color-unvisited, blue);
            }

            .outputs :global(a:visited) {
              color: var(--link-color-visited, blue);
            }

            .outputs > :global(div:empty) {
              display: none;
            }

            .outputs :global(code) {
              font-family: "Source Code Pro";
              white-space: pre-wrap;
              font-size: 14px;
            }

            .outputs :global(pre) {
              white-space: pre-wrap;
              font-size: 14px;
              word-wrap: break-word;
            }

            .outputs :global(img) {
              display: block;
              max-width: 100%;
            }

            .outputs :global(kbd) {
              display: inline-block;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 0.1em 0.5em;
              margin: 0 0.2em;
              box-shadow: 0 1px 0px rgba(0, 0, 0, 0.2), 0 0 0 2px #fff inset;
              background-color: #f7f7f7;
            }

            .outputs :global(table) {
              border-collapse: collapse;
            }

            .outputs :global(th),
            .outputs :global(td),
            .outputs :global(.th),
            /* for legacy output handling */ .outputs :global(.td) {
              padding: 0.5em 1em;
              border: 1px solid var(--theme-app-border, #cbcbcb);
            }

            .outputs :global(th) {
              text-align: left;
            }

            .outputs :global(blockquote) {
              padding: 0.75em 0.5em 0.75em 1em;
              background: var(--theme-cell-output-bg, white);
              border-left: 0.5em solid #ddd;
            }

            .outputs :global(.blockquote::before) {
              display: block;
              height: 0;
              content: "“";
              margin-left: -0.95em;
              font: italic 400%/1 Open Serif, Georgia, "Times New Roman", serif;
              color: solid var(--theme-app-border, #cbcbcb);
            }

            /* for nested paragraphs in block quotes */
            .outputs :global(blockquote) p {
              display: inline;
            }

            .outputs :global(dd) {
              display: block;
              -webkit-margin-start: 40px;
            }
            .outputs :global(dl) {
              display: block;
              -webkit-margin-before: 1__qem;
              -webkit-margin-after: 1em;
              -webkit-margin-start: 0;
              -webkit-margin-end: 0;
            }

            .outputs :global(dt) {
              display: block;
            }

            .outputs :global(dl) {
              width: 100%;
              overflow: hidden;
              padding: 0;
              margin: 0;
            }

            .outputs :global(dt) {
              font-weight: bold;
              float: left;
              width: 20%;
              /* adjust the width; make sure the total of both is 100% */
              padding: 0;
              margin: 0;
            }

            .outputs :global(dd) {
              float: left;
              width: 80%;
              /* adjust the width; make sure the total of both is 100% */
              padding: 0;
              margin: 0;
            }

            /** Adaptation for the R kernel's inline lists **/
            .outputs :global(.list-inline) li {
              display: inline;
              padding-right: 20px;
              text-align: center;
            }

            /** Note omission of the li:only-child styling **/
          `}</style>
        </div>
      );
    }

    return null;
  }
}
