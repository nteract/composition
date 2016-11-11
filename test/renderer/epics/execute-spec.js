const chai = require('chai');
const chaiImmutable = require('chai-immutable');

chai.use(chaiImmutable);


import { dummyStore } from '../../utils';

import { ActionsObservable } from 'redux-observable';

const Immutable = require('immutable');

const fromJS = Immutable.fromJS;

const expect = chai.expect;

const sinon = require('sinon');

const Rx = require('rxjs/Rx');

const Observable = Rx.Observable;
import {
  EXECUTE_CELL,
  UPDATE_CELL_EXECUTION_COUNT,
  ERROR_EXECUTING,
 } from '../../../src/notebook/constants';

import { executeCell } from '../../../src/notebook/actions';
import {
  reduceOutputs,
  executeCellStream,
  executeCellEpic,
  createExecuteRequest,
  msgSpecToNotebookFormat,
  createPagerActions,
  createSourceUpdateAction,
  createCellAfterAction,
  createCellStatusAction,
  createExecuteCellStream,
  updateCellNumberingAction,
  handleFormattableMessages,
} from '../../../src/notebook/epics/execute';

describe('executeCell', () => {
  it('returns an executeCell action', () => {
    expect(executeCell('0-0-0-0', 'import random; random.random()'))
      .to.deep.equal({
        type: EXECUTE_CELL,
        id: '0-0-0-0',
        source: 'import random; random.random()',
      });
  });
});


describe('executeCellStream', () => {
  // TODO: Refactor executeCelStream into separate testable observables
  it('is entirely too insane for me to test this well right this second', (done) => {
    const frontendToShell = new Rx.Subject();
    const shellToFrontend = new Rx.Subject();
    const mockShell = Rx.Subject.create(frontendToShell, shellToFrontend);
    const mockIOPub = new Rx.Subject();

    const channels = {
      shell: mockShell,
      iopub: mockIOPub,
    };

    // Expect message to have been sent
    frontendToShell
      .subscribe(msg => {
        expect(msg.header.msg_type).to.equal('execute_request');
        expect(msg.content.code).to.equal('import this');
      })

    const action$ = executeCellStream(channels, '0', 'import this');

    action$
      .bufferCount(3)
      .subscribe(messages => {
        expect(messages).to.deep.equal([
          // TODO: Order doesn't actually matter here
          { type: 'UPDATE_CELL_STATUS', id: '0', status: 'busy' },
          { type: 'UPDATE_CELL_PAGERS', id: '0', pagers: Immutable.List() },
          { type: 'UPDATE_CELL_OUTPUTS', id: '0', outputs: Immutable.List() },
        ]);
        done(); // TODO: Make sure message check above is called
      })


  })

  it('outright rejects a lack of channels.shell and iopub', (done) => {
    const obs = executeCellStream({}, '0', 'woo')
    obs.subscribe(null, (err) => {
        expect(err.message).to.equal('kernel not connected');
        done();
    })

  })
});

describe('createExecuteRequest', () => {
  it('creates an execute_request message', () => {
    const code = 'print("test")';
    const executeRequest = createExecuteRequest(code);

    expect(executeRequest.content.code).to.equal(code);
    expect(executeRequest.header.msg_type).to.equal('execute_request');
  });
});

describe('msgSpecToNotebookFormat', () => {
  it('converts a message to the notebook format', () => {
    const msg = {content: {data: 'test'}, header: {msg_type: 'test_header'}};
    const notebookSpecMsg = msgSpecToNotebookFormat(msg);

    expect(notebookSpecMsg).to.have.property('output_type');
    expect(notebookSpecMsg).to.have.property('data');
    expect(notebookSpecMsg.output_type).to.equal('test_header');
  });
});

describe('createPagerActions', () => {
  it('emits actions to set pagers', (done) => {
    const msgObs = Rx.Observable.from([{
      source: 'page',
      data: {'text/html': 'this is a test'},
    }]);

    const pagerAction$ = createPagerActions('1', msgObs);

    pagerAction$.subscribe((action) => {
      const expected = [{ source: 'page', data: { 'text/html': 'this is a test' } } ];
      expect(action.id).to.equal('1');
      expect(action.pagers.toJS()).to.deep.equal(expected);
      done();
    });
  });
});

describe('createCellAfterAction', () => {
  it('emits a createCellAfter action', (done) => {
    const msgObs = Rx.Observable.from([{
      source: 'set_next_input',
      text: 'This is some test text.',
      replace: false,
    }]);

    const cellAction$ = createCellAfterAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.id).to.equal('1');
      done();
    });
  });
});

describe('createCellStatusAction', () => {
  it('emits an updateCellStatus action', (done) => {
    const msgObs = Rx.Observable.from([{
      header: {
        msg_id: '123',
        msg_type: 'status',
      },
      parent_header: {},
      content: {
        'execution_state': 'idle',
      },
      metadata: {},
    }]);

    const cellAction$ = createCellStatusAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.id).to.equal('1');
      expect(action.status).to.equal('idle');
      done();
    });
  });
});

describe('updateCellNumberingAction', () => {
  it('emits updateCellExecutionCount action', (done) => {
    const msgObs = Rx.Observable.from([{
      header: {
        msg_id: '123',
        msg_type: 'execute_input',
      },
      parent_header: {},
      content: {
        'execution_count': 3,
      },
      metadata: {},
    }]);

    const cellAction$ = updateCellNumberingAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.id).to.equal('1');
      expect(action.count).to.equal(3);
      done();
    });
  });
});

describe('createSourceUpdateAction', () => {
  it('emits updateCellSource action', (done) => {
    const msgObs = Rx.Observable.from([{
      source: 'set_next_input',
      text: 'This is some test text.',
      replace: true,
    }]);

    const cellAction$ = createSourceUpdateAction('1', msgObs);

    cellAction$.subscribe((action) => {
      expect(action.source).to.equal('This is some test text.');
      done();
    });
  });
});
describe('createExecuteCellObservable', () => {
  let store = { getState: function() { return this.state; },
            state: {
              app: {
                executionState: 'starting',
                channels: 'channelInfo',
                notificationSystem: {
                  addNotification: sinon.spy(),
                },
              }
            },
          };
  const action$ = new ActionsObservable();
  it('notifies the user if kernel is not connected', () => {
    const testFunction = createExecuteCellStream(action$, store, 'source', 'id');
    const notification = store.getState().app.notificationSystem.addNotification;
    expect(notification).to.be.calledWith({
      title: 'Could not execute cell',
      message: 'The cell could not be executed because the kernel is not connected.',
      level: 'error',
    });
    expect(testFunction.subscribe).to.not.be.null;
  });
  it('emits returns an observable when kernel connected', () => {
    store.state.app.executionState = 'started'
    const executeCellStream = createExecuteCellStream(action$, store, 'source', 'id');
    expect(executeCellStream.subscribe).to.not.be.null;
  });
})

describe('executeCellEpic', () => {
  const store = { getState: function() { return this.state; },
            state: {
              app: {
                executionState: 'starting',
                channels: 'channelInfo',
                notificationSystem: {
                  addNotification: sinon.spy(),
                },
                token: 'blah'
              }
            },
          };
  it('Errors on a bad action', (done) => {
    const badInput$ = Observable.of({ type: EXECUTE_CELL });
    const badAction$ = new ActionsObservable(badInput$);
    const actionBuffer = [];
    const responseActions = executeCellEpic(badAction$, store).catch(error => {
      expect(error.message).to.equal('execute cell needs an id');
    });
    const subscription = responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([ERROR_EXECUTING]);
        done();
      },
    );
  });
  it('Errors on an action where source not a string', (done) => {
    const badInput$ = Observable.of(executeCell('id', 2));
    const badAction$ = new ActionsObservable(badInput$);
    const actionBuffer = [];
    const responseActions = executeCellEpic(badAction$, store).catch(error=> {
      expect(error.message).to.equal('execute cell needs source string');
    });
    const subscription = responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([ERROR_EXECUTING]);
        done();
      },
    );
  });
  it('Runs an epic with the approriate flow with good action', (done) => {
    const input$ = Observable.of(executeCell('id', 'source'));
    const action$ = new ActionsObservable(input$);
    const actionBuffer = [];
    const responseActions = executeCellEpic(action$, store);
    const subscription = responseActions.subscribe(
      (x) => actionBuffer.push(x.type), // Every action that goes through should get stuck on an array
      (err) => expect.fail(err, null), // It should not error in the stream
      () => {
        expect(actionBuffer).to.deep.equal([UPDATE_CELL_EXECUTION_COUNT]); // ;
        done();
      },
    );
  });
})
