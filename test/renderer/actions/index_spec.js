import { expect } from 'chai';

import Rx from '@reactivex/rxjs';

import * as actions from '../../../src/notebook/actions';
import { __RewireAPI__ as ActionsRewired } from '../../../src/notebook/actions';
import * as constants from '../../../src/notebook/constants';

import createStore from '../../../src/notebook/store';

describe('setExecutionState', () => {
  it('creates a SET_EXECUTION_STATE action', () => {
    expect(actions.setExecutionState('idle')).to.deep.equal({
      type: constants.SET_EXECUTION_STATE,
      executionState: 'idle',
    });
  })
});

describe('newKernel', () => {

  let subject = new Rx.Subject();

  let thunk = actions.newKernel();

  before(() => {
    ActionsRewired.__Rewire__('launchKernel',
      () => {
        return new Promise((resolve, reject) => {
          resolve({
            channels: 1,
            connectionFile: 2,
            spawn: 3
          });
        });
      }
    );

    ActionsRewired.__Rewire__('agendas', {
      acquireKernelInfo: function acquireKernelInfo(channels) {
        return {
          subscribe: (cb) => {
            cb({
              type: "TEST_ACTION"
            });
          }
        }
      }
    });
  });

  after(() => {
    ActionsRewired.__ResetDependency__('launchKernel');
    ActionsRewired.__ResetDependency__('agendas');
  });

  it('returns a thunk', () => {
    expect(thunk).to.be.a('function');
  });

  it('executes acquireKernelInfo and fires and action on the subject', (done) => {
    subject
      .first()
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: 'TEST_ACTION'
        });
        done();
      });

    thunk(subject);
  });

  it('returns a new kernel from the thunk', (done) => {
    subject
      .skip(1)
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: constants.NEW_KERNEL,
          channels: 1,
          connectionFile: 2,
          spawn: 3
        });
        done();
      });

    thunk(subject);
  });
});

describe('setLanguageInfo', () => {
  it('creates a SET_LANGUAGE_INFO action', () => {
    const langInfo = {
      "codemirror_mode": {
        "name": "ipython",
        "version": 3
      },
      "file_extension": ".py",
      "mimetype": "text/x-python",
      "name":"python",
      "nbconvert_exporter":"python",
      "pygments_lexer":"ipython3",
      "version":"3.5.1",
    };

    expect(actions.setLanguageInfo(langInfo)).to.deep.equal({
      type: constants.SET_LANGUAGE_INFO,
      langInfo: langInfo,
    });
  })
});

describe('save', () => {

  before(() => {
    ActionsRewired.__Rewire__('commutable',
      {
        toJS: function() {
          return {};
        }
      }
    );
  });

  after(() => {
    ActionsRewired.__ResetDependency__('writeFile');
    ActionsRewired.__ResetDependency__('commutable');
  });

  it('throws without a filename', () => {
    let subject = new Rx.Subject();
    let thunk = actions.save();
    expect(thunk.bind(null, subject)).to.throw('save needs a filename');
  });

  it('emits a start action', (done) => {
    ActionsRewired.__Rewire__('writeFile',
      (filename, notebook, cb) => {
        cb();
      }
    );
    let subject = new Rx.Subject();
    let thunk = actions.save('test.js');
    subject
    .first()
    .subscribe((action) => {
      expect(action).to.deep.equal({
        type: constants.START_SAVING
      });
      done();
    });
    thunk(subject);
  });

  it('emits a done action', (done) => {
    ActionsRewired.__Rewire__('writeFile',
      (filename, notebook, cb) => {
        cb();
      }
    );
    let subject = new Rx.Subject();
    let thunk = actions.save('test.js');
    subject
    .skip(1)
    .subscribe((action) => {
      expect(action).to.deep.equal({
        type: constants.DONE_SAVING
      });
      done();
    });
    thunk(subject);
  });

  it('throws on error', () => {
    ActionsRewired.__Rewire__('writeFile',
      (filename, notebook, cb) => {
        cb("error");
      }
    );
    let subject = new Rx.Subject();
    let thunk = actions.save('test.js');
    expect(thunk.bind(null, subject)).to.throw('error');
  });

});

describe('saveAs', () => {

  before(() => {
    ActionsRewired.__Rewire__('writeFile',
      (filename, notebook, cb) => {
        cb();
      }
    );
    ActionsRewired.__Rewire__('commutable',
      {
        toJS: function() {
          return {};
        }
      }
    );
  });

  after(() => {
    ActionsRewired.__ResetDependency__('writeFile');
    ActionsRewired.__ResetDependency__('commutable');
  });

  it('emits a change action', (done) => {
    let subject = new Rx.Subject();
    let thunk = actions.saveAs('test.js', {});
    subject
    .first()
    .subscribe((action) => {
      expect(action).to.deep.equal({
        type: constants.CHANGE_FILENAME,
        filename: 'test.js'
      });
      done();
    });
    thunk(subject, () => {});
  });

  it('dispatches save', (done) => {
    let subject = new Rx.Subject();
    let thunk = actions.saveAs('test.js', {});
    thunk(subject, (action) => {
      expect(typeof action).to.equal("function");
      done();
    });
  });

});

describe('setNotebook', () => {

  let mock = {
    getIn: function() {
      return {};
    }
  };

  before(() => {
    ActionsRewired.__Rewire__('path', {
      dirname: function() {},
      resolve: function() {}
    });
    ActionsRewired.__Rewire__('Immutable', {
      fromJS: function(data) {
        return mock;
      }
    });
  });

  after(() => {
    ActionsRewired.__ResetDependency__('path');
    ActionsRewired.__ResetDependency__('Immutable');
  });

  it('emits a SET_NOTEBOOK action', (done) => {
    let subject = new Rx.Subject();
    let thunk = actions.setNotebook({}, 'test.js');
    subject
    .first()
    .subscribe((action) => {
      console.log(action)
      expect(action).to.deep.equal({
        type: constants.SET_NOTEBOOK,
        data: mock
      });
      done();
    });
    thunk(subject, () => {});
  });

  it('dispatches newKernel', (done) => {
    let subject = new Rx.Subject();
    let thunk = actions.setNotebook({}, 'test.js');
    let dispatch = (action) => {
      expect(typeof action).to.equal('function');
      done();
    };
    thunk(subject, dispatch);
  });

});

describe('updateCellSource', () => {
  it('creates a UPDATE_CELL_SOURCE action', () => {
    expect(actions.updateCellSource('1234', '# test')).to.deep.equal({
      type: constants.UPDATE_CELL_SOURCE,
      id: '1234',
      source: '# test',
    });
  })
});

describe('updateCellOutputs', () => {
  it('creates a UPDATE_CELL_OUTPUTS action', () => {
    expect(actions.updateCellOutputs('1234', {'data': 'woo'})).to.deep.equal({
      type: constants.UPDATE_CELL_OUTPUTS,
      id: '1234',
      outputs: {'data': 'woo'},
    });
  })
});

describe('updateCellExecutionCount', () => {
  it('creates a UPDATE_CELL_EXECUTION_COUNT action', () => {
    expect(actions.updateCellExecutionCount('1234', 3)).to.deep.equal({
      type: constants.UPDATE_CELL_EXECUTION_COUNT,
      id: '1234',
      count: 3,
    });
  })
});

describe('updateCellPagers', () => {
  it('creates a UPDATE_CELL_PAGERS action', () => {
    expect(actions.updateCellPagers('1234', {'data': 'woo'})).to.deep.equal({
      type: constants.UPDATE_CELL_PAGERS,
      id: '1234',
      pagers: {'data': 'woo'},
    });
  })
});

describe('moveCell', () => {
  it('creates a MOVE_CELL action', () => {
    expect(actions.moveCell('1234', '5678', true)).to.deep.equal({
      type: constants.MOVE_CELL,
      id: '1234',
      destinationId: '5678',
      above: true,
    });
  })
});

describe('removeCell', () => {
  it('creates a REMOVE_CELL action', () => {
    expect(actions.removeCell('1234')).to.deep.equal({
      type: constants.REMOVE_CELL,
      id: '1234',
    });
  });
});

describe('focusCell', () => {
  it('creates a FOCUS_CELL action', () => {
    expect(actions.focusCell('1234')).to.deep.equal({
      type: constants.FOCUS_CELL,
      id: '1234',
    });
  });
});

describe('focusNextCell', () => {
  it('creates a FOCUS_NEXT_CELL action', () => {
    expect(actions.focusNextCell('1234')).to.deep.equal({
      type: constants.FOCUS_NEXT_CELL,
      id: '1234',
    });
  });
});

describe('createCellAfter', () => {
  it('creates a NEW_CELL_AFTER action with default empty source string', () => {
    expect(actions.createCellAfter('markdown', '1234')).to.deep.equal({
      type: constants.NEW_CELL_AFTER,
      source: '',
      cellType: 'markdown',
      id: '1234',
    });
  });
  it('creates a NEW_CELL_AFTER action with provided source string', () => {
    expect(actions.createCellAfter('code', '1234', 'print("woo")')).to.deep.equal({
      type: constants.NEW_CELL_AFTER,
      source: 'print("woo")',
      cellType: 'code',
      id: '1234',
    });
  });
});

describe('createCellBefore', () => {
  it('creates a NEW_CELL_BEFORE action', () => {
    expect(actions.createCellBefore('markdown', '1234')).to.deep.equal({
      type: constants.NEW_CELL_BEFORE,
      cellType: 'markdown',
      id: '1234',
    });
  });
});

describe('createCellAppend', () => {
  it('creates a NEW_CELL_APPEND action', () => {
    expect(actions.createCellAppend('markdown')).to.deep.equal({
      type: constants.NEW_CELL_APPEND,
      cellType: 'markdown',
    });
  });
});

describe('mergeCellAfter', () => {
  it('creates a MERGE_CELL_AFTER action', () => {
    expect(actions.mergeCellAfter('0121')).to.deep.equal({
      type: constants.MERGE_CELL_AFTER,
      id: '0121',
    });
  });
});

describe('overwriteMetadata', () => {
  it('creates an OVERWRITE_METADATA_FIELD', () => {
    expect(actions.overwriteMetadata('foo', {bar: 3})).to.deep.equal({
      type: constants.OVERWRITE_METADATA_FIELD,
      field: 'foo',
      value: {bar: 3}
    });
  });
});

describe('executeCell', () => {
  it('creates an ERROR_KERNEL_NOT_CONNECTED action with channels not setup', (done) => {
    const channels = {
    };
    const id = '235';
    const source = 'print("hey")';

    const subject = new Rx.Subject();

    subject
      .first()
      .subscribe((action) => {
        expect(action).to.deep.equal({
          type: constants.ERROR_KERNEL_NOT_CONNECTED,
          message: 'kernel not connected',
        })
        done();
      }, (action) => {
        expect.fail();
      }
    );

    actions.executeCell(channels, id, source)(subject);
  });

  // Incomplete test setup, skipping yet providing boilerplate
  it.skip('echoes actions passed on from agendas.executeCell', (done) => {
    const channels = {
      iopub: new Rx.Subject(), // need to mock these
      shell: new Rx.Subject(), // or mock agendas.executeCell
    };
    const id = '235';
    const source = 'print("hey")';

    const subject = new Rx.Subject();

    subject
      .take(4)
      .subscribe((action) => {
        expect(action).to.deep.equal({});
        done();
      }, (action) => {
        expect.fail();
      }
    );

    actions.executeCell(channels, id, source)(subject);
  });
});

describe('setNotificationSystem', () => {
  it('creates a SET_NOTIFICATION_SYSTEM action', () => {
    expect(actions.setNotificationSystem('test')).to.deep.equal({
      type: constants.SET_NOTIFICATION_SYSTEM,
      notificationSystem: 'test'
    });
  });
});
