// flow-typed signature: b1659fd036946dbdbe0ab211b3cd462e
// flow-typed version: ee4d87cd3c/react-redux_v4.x.x/flow_>=v0.30.x

/* @flow */

// Generic type abbreviation key:
//   D - stands for "Default Props"
//   P - stands for "(required) Props"
//   S - stands for "(redux) State"
//   SP - stands for "(redux) State Props", what you get from mapStateToProps
//   DP - stands for "Dispatch Props", what you get from mapDispatchToProps
//   NP - stands for "New Props", the required props of the new component that gets returned

type ConnectAll = <
  D,
  P,
  S,
  C: React$Component<D, P, S>,
  SP,
  DP,
  Dispatch: Function,
  NP: $Diff<$Diff<P, DP>, SP>
>(
  mapStateToProps: (state: Object, ownProps: NP) => SP,
  mapDispatchToProps: (dispatch: Dispatch, ownProps: NP) => DP,
  mergeProps: null | void,
  options?: { pure?: boolean, withRef?: boolean }
) => (component: Class<C>) => Class<React$Component<D, NP, S>>;

type ConnectAllStateless = <P, SP, DP, Dispatch: Function>(
  mapStateToProps: (state: Object, ownProps: $Diff<$Diff<P, DP>, SP>) => SP,
  mapDispatchToProps: (
    dispatch: Dispatch,
    ownProps: $Diff<$Diff<P, DP>, SP>
  ) => DP,
  mergeProps: null | void,
  options?: { pure?: boolean, withRef?: boolean }
) => (
  component: (props: P) => any
) => Class<React$Component<void, $Diff<$Diff<P, DP>, SP>, void>>;

type ConnectMerged = <
  D,
  P,
  S,
  C: React$Component<D, P, S>,
  SP,
  DP,
  MP,
  Dispatch: Function
>(
  mapStateToProps: (state: Object, ownProps: $Diff<$Diff<P, MP>, D>) => SP,
  mapDispatchToProps: (
    dispatch: Dispatch,
    ownProps: $Diff<$Diff<P, MP>, D>
  ) => DP,
  mergeProps: (
    stateProps: SP,
    dispatchProps: DP,
    ownProps: $Diff<$Diff<P, MP>, D>
  ) => MP,
  options?: { pure?: boolean, withRef?: boolean }
) => (component: Class<C>) => Class<React$Component<D, $Diff<P, MP>, S>>;

type ConnectMergedStateless = <P, SP, DP, MP, Dispatch: Function>(
  mapStateToProps: (state: Object, ownProps: $Diff<P, MP>) => SP,
  mapDispatchToProps: (dispatch: Dispatch, ownProps: $Diff<P, MP>) => DP,
  mergeProps: (stateProps: SP, dispatchProps: DP, ownProps: $Diff<P, MP>) => MP,
  options?: { pure?: boolean, withRef?: boolean }
) => (
  component: (props: P) => any
) => Class<React$Component<void, $Diff<P, MP>, void>>;

type ConnectNoState = <
  D,
  P,
  S,
  C: React$Component<D, P, S>,
  DP,
  Dispatch: Function
>(
  mapStateToProps: null | void,
  mapDispatchToProps: (
    dispatch: Dispatch,
    ownProps: $Diff<$Diff<P, DP>, D>
  ) => DP,
  mergeProps: null | void,
  options?: { pure?: boolean, withRef?: boolean }
) => (component: Class<C>) => Class<React$Component<D, $Diff<P, DP>, S>>;

type ConnectNoStateStatless = <P, DP, Dispatch: Function>(
  mapStateToProps: null | void,
  mapDispatchToProps: (dispatch: Dispatch, ownProps: $Diff<P, DP>) => DP,
  mergeProps: null | void,
  options?: { pure?: boolean, withRef?: boolean }
) => (
  component: (props: P) => any
) => Class<React$Component<void, $Diff<P, DP>, void>>;

type ConnectDispatch = <
  D,
  P,
  S,
  C: React$Component<D, P, S>,
  SP,
  Dispatch: Function,
  NP: $Diff<P, { dispatch: Dispatch } & SP & D>
>(
  mapStateToProps: (state: Object, ownProps: NP) => SP,
  mapDispatchToProps: null | void,
  mergeProps: null | void,
  options?: { pure?: boolean, withRef?: boolean }
) => (
  component: Class<C>
) => Class<React$Component<D, $Diff<$Diff<P, { dispatch: Dispatch }>, SP>, S>>;

type ConnectDispatchStateless = <P, SP, Dispatch: Function>(
  mapStateToProps: (
    state: Object,
    ownProps: $Diff<$Diff<P, { dispatch: Dispatch }>, SP>
  ) => SP,
  mapDispatchToProps: null | void,
  mergeProps: null | void,
  options?: { pure?: boolean, withRef?: boolean }
) => (
  component: (props: P) => any
) => Class<React$Component<void, $Diff<P, SP & { dispatch: Dispatch }>, void>>;

type ConnectDefault = <
  D,
  P,
  S,
  C: React$Component<D, P, S>,
  Dispatch: Function
>() => (
  component: Class<C>
) => Class<React$Component<D, $Diff<P, { dispatch: Dispatch }>, S>>;

type ConnectDefaultStateless = () => <P>(
  component: (props: P) => any
) => Class<React$Component<void, $Diff<P, { dispatch: Function }>, void>>;

declare module "react-redux" {
  declare var exports: {
    connect: ConnectAll &
      ConnectAllStateless &
      ConnectMerged &
      ConnectMergedStateless &
      ConnectNoState &
      ConnectNoStateStatless &
      ConnectDispatch &
      ConnectDispatchStateless &
      ConnectDefault &
      ConnectDefaultStateless,
    Provider: ReactClass<{ store: Object, children?: any }>
  };
}
