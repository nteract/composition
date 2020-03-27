import * as React from "react";
import styled from "styled-components";

interface Props {
  prompt: string;
  password: boolean;
  submitPromptReply: any;
}

interface State {
  value: string;
}

const Container = styled.div`
  margin-left: var(--prompt-width, 50px);
  padding: 5px;

  & label {
    padding-right: 5px;
  }
`;

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
    return (
      <Container>
        <form onSubmit={this.handleSubmitPromptReply}>
          {this.props.prompt && <label>{this.props.prompt}</label>}
          <input
            type={this.props.password ? "password" : "text"}
            value={this.state.value}
            onChange={this.handleChange}
          />
          <input type="submit" />
        </form>
      </Container>
    );
  }
}

export default PromptRequest;
