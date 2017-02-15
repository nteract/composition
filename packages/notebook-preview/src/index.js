/* @flow */
import React from 'react';
import Notebook from './notebook';

const transformer = require('@nteract/transforms');
const commutable = require('@nteract/commutable');
const Immutable = require('immutable');

type Props = {
  notebook: Immutable.Map<string, any> | Object;
}

const NotebookPreview = (props: Props) => {
  const nb = props.notebook;

  // Allow passing a direct notebook on through
  const notebook = Immutable.Map.isMap(nb) ? nb : commutable.fromJS(nb);
  return (
    <Notebook
      notebook={notebook}
      theme="light"
      displayOrder={transformer.displayOrder}
      transforms={transformer.transforms}
    />
  );
}

export default NotebookPreview;
