import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { actions, ContentRef } from "@nteract/core";

// Show nothing while loading the notebook app
const NotebookPlaceholder = (props: any) => null;

interface State {
  App: React.ComponentType<{ contentRef: ContentRef }>;
}

interface Props {
  contentRef: ContentRef;
  addTransform(component: any): void;
}

class Notebook extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      App: NotebookPlaceholder
    };
  }

  loadApp() {
    import(
      /* webpackChunkName: "notebook-app-component" */ "@nteract/notebook-app-component"
    ).then(module => {
      this.setState({ App: module.default });
    });
  }

  loadTransforms() {
    import(/* webpackChunkName: "plotly" */ "@nteract/transform-plotly").then(
      module => {
        this.props.addTransform(module.default);
        this.props.addTransform(module.PlotlyNullTransform);
      }
    );

    import(
      /* webpackChunkName: "tabular-dataresource" */ "@nteract/data-explorer"
    ).then(module => {
      this.props.addTransform(module.default);
    });

    // import(
    //   /* webpackChunkName: "jupyter-widgets" */ "@nteract/jupyter-widgets"
    // ).then(module => {
    //   this.props.addTransform(module.default);
    // });

    import("@nteract/transform-model-debug").then(module => {
      this.props.addTransform(module.default);
    });

    // import(
    //   /* webpackChunkName: "vega-transform" */ "@nteract/transform-vega"
    // ).then(module => {
    //   this.props.addTransform(module.VegaLite1);
    //   this.props.addTransform(module.VegaLite2);
    //   this.props.addTransform(module.VegaLite3);
    //   this.props.addTransform(module.VegaLite4);
    //   this.props.addTransform(module.Vega2);
    //   this.props.addTransform(module.Vega3);
    //   this.props.addTransform(module.Vega4);
    //   this.props.addTransform(module.Vega5);
    // });

    // TODO: The geojson transform will likely need some work because of the basemap URL(s)
    // import GeoJSONTransform from "@nteract/transform-geojson";
  }

  componentDidMount() {
    this.loadApp();
    this.loadTransforms();
  }

  render() {
    const App = this.state.App;

    return (
      <App contentRef={this.props.contentRef}></App>
    );
  }
}

interface InitialProps {
  contentRef: ContentRef;
}

const makeMapDispatchToProps = (
  initialDispatch: Dispatch,
  initialProps: InitialProps
) => {
  const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      addTransform: (transform: React.ComponentType & { MIMETYPE: string }) => {
        return dispatch(
          actions.addTransform({
            mediaType: transform.MIMETYPE,
            component: transform
          })
        );
      }
    };
  };
  return mapDispatchToProps;
};

export default connect(
  null,
  makeMapDispatchToProps
)(Notebook);
