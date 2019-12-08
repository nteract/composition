import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  actions,
  selectors,
  ContentRef,
  AppState,
  InputRequestMessage
} from "@nteract/core";

interface ComponentProps {
  contentRef: ContentRef;
  id: string;
}

interface StateProps {
  prompts: Immutable.List<InputRequestMessage>;
}

interface DispatchProps {
  submitPromptReply: (value: string) => void;
}

interface State {
  value: string;
}

type Props = ComponentProps & StateProps & DispatchProps;

export class PromptRequest extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { value: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitPromptReply = this.handleSubmitPromptReply.bind(this);
  }

  handleSubmitPromptReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    this.props.submitPromptReply(this.state.value);
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ value: event.target.value });
  }

  render() {
    const { prompts } = this.props;
    return (
      <div>
        {prompts.map(prompt => (
          <form onSubmit={this.handleSubmitPromptReply}>
            <label>{prompt.prompt}</label>
            <input
              type={prompt.password ? "password" : "text"}
              value={this.state.value}
              onChange={this.handleChange}
            />
            <input type="submit" />
          </form>
        ))}
      </div>
    );
  }
}

const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const mapStateToProps = (state: AppState) => {
    const { contentRef, id } = ownProps;
    const model = selectors.model(state, { contentRef });
    if (model && model.type == "notebook") {
      const prompts = selectors.notebook.cellPromptsById(model, { id });
      return { prompts };
    }
    return { prompts: Immutable.List() };
  };
  return mapStateToProps;
};

const makeMapDispatchToProps = (
  initialDispatch: Dispatch,
  ownProps: ComponentProps
): ((dispatch: Dispatch) => DispatchProps) => {
  const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    const { contentRef } = ownProps;
    return {
      submitPromptReply: (value: string) =>
        dispatch(actions.sendInputReply({ value, contentRef }))
    };
  };
  return mapDispatchToProps;
};

export default connect<StateProps, DispatchProps, ComponentProps, AppState>(
  makeMapStateToProps,
  makeMapDispatchToProps
)(PromptRequest);
