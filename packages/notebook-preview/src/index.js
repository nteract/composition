/* @flow */
import React from "react";
import Notebook from "./notebook";

const commutable = require("@nteract/commutable");
const Immutable = require("immutable");

type Props = {
  notebook: Immutable.Map<string, any> | Object,
  displayOrder: Immutable.List<string>,
  transforms: Immutable.Map<string, any>
};

const NotebookPreview = (props: Props) => {
  const nb = props.notebook;

  // Allow passing a direct notebook on through
  const notebook = Immutable.Map.isMap(nb) ? nb : commutable.fromJS(nb);
  return (
    <Notebook
      notebook={notebook}
      theme="light"
      displayOrder={props.displayOrder}
      transforms={props.transforms}
    />
  );
};

export default NotebookPreview;
