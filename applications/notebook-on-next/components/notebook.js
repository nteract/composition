// @flow

// Placeholder notebook view, copied and modifed from commuter

import React, { PropTypes as T } from "react";

import NotebookPreview from "@nteract/notebook-preview";
import MarkdownTransform from "@nteract/transforms/lib/markdown";
import DataResourceTransform from "@nteract/transform-dataresource";
import { VegaLite, Vega } from "@nteract/transform-vega";
import { PlotlyNullTransform, PlotlyTransform } from "./transforms";

import {
  standardTransforms,
  standardDisplayOrder,
  registerTransform
} from "@nteract/transforms";

// Order is important here. The last transform in the array will have order `0`.
const { transforms, displayOrder } = [
  DataResourceTransform,
  PlotlyNullTransform,
  PlotlyTransform,
  VegaLite,
  Vega
].reduce(registerTransform, {
  transforms: standardTransforms,
  displayOrder: standardDisplayOrder
});

type NotebookProps = {
  content: Object
};

export class Notebook extends React.Component<NotebookProps> {
  render() {
    return (
      <NotebookPreview
        notebook={this.props.content}
        displayOrder={displayOrder}
        transforms={transforms}
      />
    );
  }
}
