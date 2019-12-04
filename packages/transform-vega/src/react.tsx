import * as React from "react";
import { Result } from "vega-embed";
import { embed, VegaOptions } from "./external";
import { VegaMediaType } from "./mime";

/** Props needed for embedding a certain Vega (Lite) media type. */
export interface VegaEmbedProps<T extends VegaMediaType> {
  spec: Readonly<{}>;
  mediaType: T;
  options?: Partial<VegaOptions>,
  resultHandler?: (result: any) => void;
  errorHandler?: (error: Error) => void;
}

/** React component embedding a certain Vega (Lite) media type. */
export class VegaEmbed<T extends VegaMediaType>
  extends React.Component<VegaEmbedProps<T>> {

  private anchorRef: React.RefObject<HTMLDivElement>;
  private embedResult: Result | void;

  constructor(props: VegaEmbedProps<T>) {
    super(props);
    this.anchorRef = React.createRef<HTMLDivElement>();
    this.embedResult = undefined;
  }

  render(): JSX.Element {
    return <div ref={this.anchorRef} />;
  }

  async callEmbedder(): Promise<void> {
    if (this.anchorRef.current === null) { return; }

    try {
      this.embedResult = await embed(
        this.anchorRef.current,
        this.props.mediaType,
        this.props.spec,
        this.props.options,
      );

      if (this.props.resultHandler) {
        this.props.resultHandler(this.embedResult);
      }
    }
    catch (error) {
      (this.props.errorHandler || console.error)(error);
    }
  }

  shouldComponentUpdate(nextProps: VegaEmbedProps<T>): boolean {
    return this.props.spec !== nextProps.spec;
  }

  componentDidMount(): void {
    this.callEmbedder().then();
  }

  componentDidUpdate(): void {
    this.callEmbedder().then();
  }

  componentWillUnmount(): void {
    if (this.embedResult) {
      if (this.embedResult.finalize) {
        // For Vega-Embed 6.2+
        this.embedResult.finalize();
      } else {
        if (
          this.embedResult.view &&
          this.embedResult.view.finalize
        ) {
          this.embedResult.view.finalize();
        }
      }
    }

    this.embedResult = undefined;
  }
}
