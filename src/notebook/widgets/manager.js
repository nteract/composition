import Rx from 'rxjs/Rx';
import { ManagerBase } from 'jupyter-js-widgets';
import { BackendSync } from './backend-sync';
import { ModelUpdater } from './model-updater';
import { associateCellToMsg, setWidgetState } from '../actions';
import { sendCommMessage } from './comms';

export class WidgetManager extends ManagerBase {
  constructor(store) {
    super();
    this.store = store;
    this.modelPromises = {};
    this.lastTouchView = null;

    // Create the mechanisms for syncing between redux state, backbone state,
    // and the backend.
    this.backendToRedux = new BackendSync(
      store,
      this.createModel.bind(this),
      this.comm_target_name,
      this.version_comm_target_name,
      () => this.lastTouchView
    );
    this.reduxToManager = new ModelUpdater(store, this);
  }

  get versionValidated() {
    return this.backendToRedux.versionValidated;
  }

  createModel(id, data) {
    let modelLoaded;
    this.modelPromises[id] = new Promise(resolve => (modelLoaded = resolve));
    // Immediately set an initial dummy state of the widget so that the widget
    // deletion code in model-updater.js doesn't delete the widget.
    this.store.dispatch(setWidgetState(id, { id }));

    const modelPromise = this.new_model({
      model_name: data._model_name,
      model_module: data._model_module,
      model_id: id,
    }, data).catch(err => console.error("Couldn't create a model.", err));

    // Listen for changes to the model so that they can be applied to the store
    // Create an observable from the current model state, and from the model
    // change event.  Merge them and use that observable to update the store.
    const modelInfoPromise = modelPromise.then(model => {
      model.comm = new PhonyComm(this.store, id); // eslint-disable-line
      modelLoaded(model);
      const initialState = Rx.Observable
        .of(this.getSerializedModelState(model));
      const stateChangeEvents = Rx.Observable
        .fromEvent(model, 'change')
        .map(() => this.getSerializedModelState(model));
      const stateChanges = initialState.merge(stateChangeEvents);
      return { model, stateChanges };
    });

    return modelInfoPromise;
  }

  createViewForModel(id, cellId) {
    return this.modelPromises[id].then(model => this.create_view(model, { cellId }));
  }

  getSerializedModelState(model) {
    const state = model.constructor._serialize_state(model.get_state(false), this);
    // TODO HACK
    // Here I'm lazy so I convert from JS to JSON and back to traverse the
    // object hierarcy serializing where needed.
    return state.then(js => JSON.parse(JSON.stringify(js)));
  }

  setModelState(id, serializedState) {
    return this.modelPromises[id].then(model => {
      const statePromise = model.constructor._deserialize_state(serializedState, this);
      return statePromise.then(state => model.set_state(state));
    });
  }

  deleteModels(ids) {
    // To delete widgets make their "comms close" which will trigger the
    // natural cleanup subroutines of the widgets.
    ids.forEach(deletedId => {
      this.modelPromises[deletedId].then(model => {
        model._handle_comm_closed();
        delete this.modelPromises[deletedId];
      });
    });
  }

  callbacks(view) {
    const callbacks = super.callbacks(view);
    this.lastTouchView = view || this.lastTouchView;
    return {
      ...callbacks,
      cellId: view.options.cellId,
    };
  }
}

class PhonyComm {
  constructor(store, id) {
    this.id = id;
    this.store = store;
  }

  send(data, callbacks) {
    // Only allow custom messages to be sent to the backend.  This prevents
    // the widget machinery from sending state updates directly to the backend.
    // Instead, the redux widget state management system should send the
    // updates.  See backend-sync.js for the state logic.
    if (!data || data.method !== 'custom') return;

    sendCommMessage(this.store, this.id, data || {}).then(msgId => {
      // Associate the cell of the widget view to the message
      this.store.dispatch(associateCellToMsg(callbacks.cellId, msgId));
    });
  }

  close() { }
}
