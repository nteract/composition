import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import {
  ImmutableDisplayData,
  ImmutableExecuteResult,
  JSONObject
} from "@nteract/commutable";
import { actions, AppState, ContentRef, selectors } from "@nteract/core";

import memoizeOne from "memoize-one";

interface ComponentProps {
  output_type: string;
  id: string;
  contentRef: ContentRef;
  index?: number;
  output?: ImmutableDisplayData | ImmutableExecuteResult;
}

interface StateProps {
  Media: React.ComponentType<any>;
  mediaType?: string;
  output?: ImmutableDisplayData | ImmutableExecuteResult;
  data?: any;
  metadata?: Immutable.Map<string, any>;
  theme?: string;
}

interface DispatchProps {
  mediaActions: {
    onMetadataChange: (metadata: JSONObject, mediaType: string) => void;
  };
}

const PureTransformMedia = (
  props: ComponentProps & StateProps & DispatchProps
) => {
  const {
    Media,
    mediaActions,
    mediaType,
    data,
    metadata,
    theme,
    contentRef,
    id
  } = props;

  // If we had no valid result, return an empty output
  if (!mediaType || !data) {
    return null;
  }

  return (
    <Media
      {...mediaActions}
      data={data}
      metadata={metadata}
      theme={theme}
      contentRef={contentRef}
      id={id}
    />
  );
};

export const richestMediaType = (
  output: ImmutableExecuteResult | ImmutableDisplayData,
  order: Immutable.List<string>,
  handlers: Immutable.Map<string, any>
) => {
  const outputData = output.data;

  // Find the first mediaType in the output data that we support with a handler
  const mediaType = order.find(key => {
    return (
      outputData.hasOwnProperty(key) &&
      (handlers.hasOwnProperty(key) || handlers.get(key, false))
    );
  });

  return mediaType;
};

export const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
) => {
  const { output_type, output } = ownProps;

  const memoizedMetadata = memoizeOne(immutableMetadata =>
    immutableMetadata ? immutableMetadata.toJS() : {}
  );

  const mapStateToProps = (state: AppState): StateProps => {
    // This component should only be used with display data and execute result
    if (
      !output ||
      !(output_type === "display_data" || output_type === "execute_result")
    ) {
      console.warn(
        "connected transform media managed to get a non media bundle output"
      );
      return {
        Media: () => null
      };
    }

    const handlers = selectors.transformsById(state);
    const order = selectors.displayOrder(state);
    const theme = selectors.userTheme(state);

    const mediaType = richestMediaType(output, order, handlers);

    if (mediaType) {
      const metadata = memoizedMetadata(output.metadata.get(mediaType));
      const data = output.data[mediaType];
      const Media = selectors.transform(state, { id: mediaType });
      return {
        Media,
        mediaType,
        data,
        metadata,
        theme
      };
    }
    return {
      Media: () => null,
      mediaType,
      output,
      theme
    };
  };
  return mapStateToProps;
};

const makeMapDispatchToProps = (
  initialDispath: Dispatch,
  ownProps: ComponentProps
) => {
  const { id, contentRef, index } = ownProps;
  const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
      mediaActions: {
        onMetadataChange: (metadata: JSONObject, mediaType: string) => {
          dispatch(
            actions.updateOutputMetadata({
              id,
              contentRef,
              metadata,
              index: index || 0,
              mediaType
            })
          );
        }
      }
    };
  };
  return mapDispatchToProps;
};

const TransformMedia = connect<
  StateProps,
  DispatchProps,
  ComponentProps,
  AppState
>(
  makeMapStateToProps,
  makeMapDispatchToProps
)(PureTransformMedia);

export default TransformMedia;
