const chai = require('chai');
const expect = chai.expect
import { errorMiddleware } from '../../src/notebook/middlewares';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('The error middleware', () => {

  it('errors with a payload message when given', () => {
    const store = { getState: function() { return this.state; },
              dispatch: function(action) { return this.reducer(store, action); },
              state: {
                app: {
                  get: function(key) {
                    return this.notificationSystem;
                  },
                  notificationSystem: {
                    addNotification: sinon.spy(),
                  },
                }
              },
              reducer: sinon.spy(),
            };
    const next = action => store.dispatch(action);
    const action = {type: 'ERROR', payload: 'This is a payload', err: true};
    errorMiddleware(store)(next)(action);
    const notification = store.getState().app.notificationSystem.addNotification
    const truth = notification.calledWith({
      title: 'ERROR',
      message: 'This is a payload',
      dismissible: true,
      postion: 'tr',
      level: 'error',
    });
    debugger;
    expect(store.reducer).to.be.called;
  });
  it('errors with action as message when no payload', () => {
    const store = { getState: function() { return this.state; },
              dispatch: function(action) { return this.reducer(store, action); },
              state: {
                app: {
                  get: function(key) {
                    return this.notificationSystem;
                  },
                  notificationSystem: {
                    addNotification: sinon.spy(),
                  },
                }
              },
              reducer: sinon.spy(),
            };
    const next = action => store.dispatch(action);
    const action= { type: 'ERROR', payloa: 'typo', err: true};
    errorMiddleware(store)(next)(action);
    const notification = store.getState().app.notificationSystem.addNotification
    expect(notification).calledWith({
      title: 'ERROR',
      message: action,
      dismissible: true,
      postion: 'tr',
      level: 'error',
    });
    expect(store.reducer).to.be.called;
  });
});
