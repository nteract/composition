import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import {
  actions,
  createContentRef,
  createKernelRef,
  ContentRef,
  HostRecord,
  KernelRef,
  makeJupyterHostRecord,
  ServerConfig
} from "@nteract/core";
import NotebookApp from "@nteract/notebook-app-component";
import styled from "styled-components";

type ComponentProps = {
  filepath: string,
  host: ServerConfig
}

interface DispatchProps {
  setAppHost: (host: HostRecord) => void;
  fetchContent: (
    filepath: string,
    contentRef: ContentRef,
    kernelRef: KernelRef
  ) => void;
}

type Props = ComponentProps & DispatchProps;

type State = {
  contentRef: ContentRef;
  kernelRef: KernelRef;
}

const BinderDiv = styled.div`
    
`;

class Binder extends React.Component<Props, State> {
    constructor(props){
        super(props);
        props.setAppHost(
          makeJupyterHostRecord({ ...props.host, origin: props.host.endpoint })
        );
        
        this.state = {
          contentRef: createContentRef(),
          kernelRef: createKernelRef(),
        }
    }

    componentDidMount() {
      const { filepath } = this.props;
      const { contentRef, kernelRef } = this.state;
      this.props.fetchContent(filepath, contentRef, kernelRef);
    }

    render() {
      return (
        <BinderDiv>  
            { this.state.contentRef ? (<NotebookApp contentRef={this.state.contentRef} />) : "Wating"}
        </BinderDiv>    
      );
    }
  } 

  const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAppHost: (host: HostRecord) => dispatch(actions.setAppHost({ host })),
    fetchContent: (
      filepath: string,
      contentRef: ContentRef,
      kernelRef: KernelRef
    ) =>
      dispatch(
        actions.fetchContent({ filepath, contentRef, kernelRef, params: {} })
      )
  });

  export default connect(null, mapDispatchToProps)(Binder);