import Rx from 'rxjs/Rx';
import difference from 'lodash.difference';

/**
 * Updates widget models based on the redux store state.
 */
export class ModelUpdater {

  /**
   * Public constructor.
   * @param  {Redux.store} store
   * @param  {widgets.WidgetManager} manager
   * @return {ModelUpdater}
   */
  constructor(store, manager) {
    // Listen for changes to the redux store widgets
    this.widgetSubscriptions = {};
    Rx.Observable.from(store)
      .pluck('document')
      .map(document => document.getIn(['widgets', 'widgetModels']))
      .distinctUntilChanged((a, b) => !a || a.equals(b))
      .subscribe(this.reduxStateChange.bind(this, store, manager));
  }

  /**
   * Update the widget models based on the state store change
   * @param  {widgets.WidgetManager} manager
   * @param  {object} newState - state of the widgets key
   */
  reduxStateChange(store, manager, newState) {
    if (!newState) return;

    // Delete widgets that no longer exist in the state.
    const deleted = difference(
      Object.keys(manager.modelPromises),
      newState.keySeq().toJS()
    );
    manager.deleteModels(deleted);
    deleted.forEach(id => {
      this.widgetSubscriptions[id].unsubscribe();
      delete this.widgetSubscriptions[id];
    });

    // Create missing state subscriptions.
    const created = difference(
      newState.keySeq().toJS(),
      Object.keys(this.widgetSubscriptions)
    );
    created.forEach(id => {
      this.widgetSubscriptions[id] = Rx.Observable.from(store)
        .pluck('document')
        .map(document => document.getIn(['widgets', 'widgetModels', id]))
        .distinctUntilChanged((a, b) => !a || a.equals(b))
        .subscribe(state => {
          manager.setModelState(id, state.toJS());
        });
    });
  }
}
