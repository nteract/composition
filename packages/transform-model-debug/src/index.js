/* @flow */
import React from "react";

const Immutable = require("immutable");

type Props = {
  data: string,
  models: Immutable.Map<string, any>,
  transient: Immutable.Map<string, any>
};

class ModelDebug extends React.Component {
  props: Props;
  static MIMETYPE = "application/x-nteract-model-debug+json";

  shouldComponentUpdate(): boolean {
    return true;
  }

  render(): ?React.Element<any> {
    const { models, data, transient } = this.props;

    const layout = data;

    /**
     *
     * layout is
     *
     * {
     *  {'type': 'h1', }
     * }
     *
     */

    // TODO: Provide model IDs on transient field
    // For now, if modelID is not provided (or model does not exist),
    // show all the models
    console.log(transient);
    if (!transient) {
      // No messages have come in for this yet
      return null;
    }

    const modelID = transient.get("model_id");
    console.log(modelID);
    if (!modelID) return null;

    // Pretend spec
    const model = models.get(modelID);
    if (!model) {
      return null;
    }
    console.log(model);
    return (
      <div>
        <input
          value={model.get("text")}
          onChange={evt => {
            this.props.onModelUpdate(this.props.modelID);
          }}
        />
        <pre>{JSON.stringify(models, null, 2)}</pre>
      </div>
    );
  }
}

export default ModelDebug;
