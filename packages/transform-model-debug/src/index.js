/* @flow */
import React from "react";

const Immutable = require("immutable");

type Props = {
  data: string,
  models: Immutable.Map<string, any>,
  modelID: string
};

class ModelDebug extends React.Component {
  props: Props;
  static MIMETYPE = "application/x-nteract-model-debug+json";

  shouldComponentUpdate(): boolean {
    return true;
  }

  render(): ?React.Element<any> {
    const { models, data, modelID } = this.props;
    // TODO: Provide model IDs on transient field
    // For now, if modelID is not provided (or model does not exist),
    // show all the models
    const model = models.get(modelID, models);
    return (
      <div>
        <h1>{JSON.stringify(data, null, 2)}</h1>
        <pre>
          {model ? JSON.stringify(model, null, 2) : null}
        </pre>
      </div>
    );
  }
}

export default ModelDebug;
