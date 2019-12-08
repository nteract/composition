import Immutable from "immutable";
import React from "react";

import { ContentRef } from "@nteract/core";
import { Media, KernelOutputError, StreamText } from "@nteract/outputs";
import { Source } from "@nteract/presentational-components";
import CodeMirrorEditor from "@nteract/editor";

import Editor from "../inputs/editor";
import Prompt from "../inputs/prompt";
import TransformMedia from "../outputs/transform-media";
import Outputs from "../outputs";
import Pagers from "../outputs/pagers";
import InputPrompts from "../outputs/input-prompts";
import Input from "../inputs/input";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  cell: Immutable.Map<string, any>;
  cell_type: "code";
  children: React.ReactNode;
}

const PromptText = (props: any) => {
  if (props.status === "busy") {
    return <React.Fragment>{"[*]"}</React.Fragment>;
  }
  if (props.status === "queued") {
    return <React.Fragment>{"[…]"}</React.Fragment>;
  }
  if (typeof props.executionCount === "number") {
    return <React.Fragment>{`[${props.counter}]`}</React.Fragment>;
  }
  return <React.Fragment>{"[ ]"}</React.Fragment>;
};

const childWithDisplayName = (
  children: React.ReactNode,
  displayName: string
): React.ReactNode => {
  let chosenOne;
  React.Children.forEach(children, child => {
    if (child.type && child.type.displayName === displayName) {
      chosenOne = child;
    }
  });
  return chosenOne;
};

export default class CodeCell extends React.Component<ComponentProps> {
  static defaultProps = {
    cell_type: "code"
  };

  render() {
    const { id, contentRef, children } = this.props;

    /**
     * Consumers of this React component can override specific subcomponents
     * without having to override the entire component.
     */
    const OutputsOverride = childWithDisplayName(children, "Outputs");
    const PromptOverride = childWithDisplayName(children, "Prompt");
    const PagersOverride = childWithDisplayName(children, "Pagers");
    const EditorsOverride = childWithDisplayName(children, "Editors");

    return (
      <div className="nteract-code-cell">
        <Input id={id} contentRef={contentRef}>
          {PromptOverride ? (
            <PromptOverride id={id} contentRef={contentRef} />
          ) : (
            <Prompt id={id} contentRef={contentRef}>
              <PromptText />
            </Prompt>
          )}
          <Source>
            <Editor id={id} contentRef={contentRef}>
              {EditorsOverride ? <EditorsOverride /> : <CodeMirrorEditor />}
            </Editor>
          </Source>
        </Input>
        {PagersOverride ? (
          <PagersOverride id={id} contentRef={contentRef} />
        ) : (
          <Pagers id={id} contentRef={contentRef}>
            <Media.Json />
            <Media.JavaScript />
            <Media.HTML />
            <Media.Markdown />
            <Media.LaTeX />
            <Media.SVG />
            <Media.Image />
            <Media.Plain />
          </Pagers>
        )}
        {OutputsOverride ? (
          <OutputsOverride id={id} contentRef={contentRef} />
        ) : (
          <Outputs id={id} contentRef={contentRef}>
            <TransformMedia
              output_type={"display_data"}
              id={id}
              contentRef={contentRef}
            />
            <TransformMedia
              output_type={"execute_result"}
              id={id}
              contentRef={contentRef}
            />
            <KernelOutputError />
            <StreamText />
          </Outputs>
        )}
        <InputPrompts id={id} contentRef={contentRef} />
      </div>
    );
  }
}
