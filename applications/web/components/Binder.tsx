import React, { useState, useEffect } from "react";
import { Dispatch } from "redux";
import { getLanguage} from "../util/helpers"
import { connect } from "react-redux";
import {
  AppState,
  actions,
  createContentRef,
  createKernelRef,
  ContentRef,
  HostRecord,
  KernelRef,
  makeJupyterHostRecord,
  ServerConfig
} from "@nteract/core";
import NotebookApp from "@nteract/notebook-app-component/lib/notebook-apps/web-draggable";
import { contentRefByFilepath } from "@nteract/selectors";
import { createNotebookModel } from "../util/helpers"

type ComponentProps = {
  filepath: string,
  getContent: (x: string) => Promise<any>,
  host: ServerConfig
}

interface DispatchProps {
  setAppHost: (host: HostRecord) => void;
  fetchContentFulfilled: (filepath: string, model: any, contentRef: ContentRef, kernelRef: KernelRef) => void;
}

type StateProps = {
  contentRef: string
}

type Props = ComponentProps & DispatchProps & StateProps;

const makeMapStateToProps = (initialState: AppState, ownProps: ComponentProps) => {
  const mapStateToProps = (state: AppState, ownProps: ComponentProps): StateProps => {
    const { filepath } = ownProps
    const ref = contentRefByFilepath(state, { filepath: filepath })
    return { contentRef: ref }
  }

  return mapStateToProps
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAppHost: (host: HostRecord) => dispatch(actions.setAppHost({ host })),
  fetchContentFulfilled: (filepath: string, model: any, contentRef: ContentRef, kernelRef: KernelRef) => dispatch(actions.fetchContentFulfilled({ filepath, model, contentRef, kernelRef }))
});

const Binder = (props: Props) => {
  const [contentRef, setContentRef] = useState("")
  const { filepath } = props
  // We need to fetch content again as the filePath has been updated
  useEffect(() => {
    if (props.contentRef === undefined) {
      // Since contentRef for filepath is undefined
      // We generate new contentRef and use that
      const cr = createContentRef()
      const kr = createKernelRef()
      setContentRef(cr)

      // Get content from github
      let extension = filepath.split('.').pop()
      if (getLanguage(extension) == "ipynb") {
          props.getContent(filepath).then(({ data }) => {
          const content = atob(data['content'])
          const notebook = createNotebookModel(filepath, content);
          // Set content in store
          props.fetchContentFulfilled(filepath, notebook, cr, kr);
        })
      }
    } else {
      setContentRef(props.contentRef)
    }

  }, [filepath])

  // Once the host is set, add it
  useEffect(() => {
    if (props.host.endpoint != "") {
      props.setAppHost(makeJupyterHostRecord({
        ...props.host,
        origin: props.host.endpoint
      }));
    }

  }, [props.host])

  return ( < NotebookApp contentRef={contentRef} />)

}


// If we want to pass on the default values
Binder.defaultProps = {
  host: {
    crossDomain: true,
    endpoint: "",
    token: "",
  }
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Binder);
