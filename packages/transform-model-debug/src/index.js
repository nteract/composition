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

    // Pretend spec
    console.log(modelID);
    const model = models.get(modelID);
    if (!model) {
      return null;
    }
    console.log(model);
    return (
      <div>
        <input value={model.get("text")} />
        <pre>{JSON.stringify(models, null, 2)}</pre>
      </div>
    );
  }
}

export default ModelDebug;
