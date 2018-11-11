import * as React from "react";
import {Subject} from "rxjs";

// import { OuterShim } from "./outer-shim";

type Props = {
  data: { model_id: string },
  channels: Subject<any>
};

/**
 * Component used to render a widget view.
 *
 * Given a kernel and widget model id, this component will render a widget
 * view for the widget model. The widget view and widget models are isolated to
 * a cross domain iframe. Since they have access to the kernel, they are capable
 * of communicating directly with the kernel instance which makes them atypical.
 *
 * Even though it may appear to be pure, since it doesn't have react state, this
 * component's iframe maintains it's own state in communication with the kernel.
 */
export class WidgetDisplay extends React.Component<Props, null> {
  static MIMETYPE = "application/vnd.jupyter.widget-view+json";

  // TODO: Uncomment this and related code in a follow-up PR.
  // The outer shim is responsable for managing the rendered cross domain
  // iframe, communicating with it, and relaying information to and from the
  // kernel.
  // private shim: OuterShim;

  // A reference to the div which we can inject the cross domain widget iframe.
  private container = React.createRef<HTMLDivElement>();

  /** @override */
  componentDidMount() {
    if (!this.container.current) return;

    // When the component has mounted, inject the widget iframe.
    // const view = this.shim.getView();
    // this.container.current.appendChild(view);
  }

  /** @override */
  componentWillUnmount() {
    // if (this.shim) {
    //   this.shim.dispose();
    //   delete this.shim;
    // }
  }

  /** @override */
  shouldComponentUpdate(nextProps: Props): boolean {
    // Only update if the model_id or kernel_id have changed.
    if (nextProps.data.model_id !== this.props.data.model_id) {
      return true;
    }

    // If the channels have changed, we need to make sure that we connect the
    // shim to the new channels.
    if (nextProps.channels !== this.props.channels) {
      return true;
    }

    return false;
  }

  /** @override */
  render() {
    this.createOrUpdateShim();

    return (
      <pre>
        Jupyter-Widgets are not yet supported in nteract.
        <div ref={this.container} />
      </pre>
    );
  }

  /**
   * Creates or updates the existing shim to the current model id and kernel.
   */
  private createOrUpdateShim() {
    // if (!this.shim) {
    //   this.shim = new OuterShim();
    // }
    // this.shim.setCommMsgsSubject(this.props.channels);
    // this.shim.setModelId(this.props.data.model_id);
  }
}
