export function stateObservable(actions$, store) {
  return actions$.map(() => store.getState());
}
