const chai = require('chai');
const chaiImmutable = require('chai-immutable');
const expect = chai.expect;

const Immutable = require('immutable');
const GitHub = require('github');
const fromJS = Immutable.fromJS;
import { dummyCommutable } from '../dummy-nb';
import { dummyStore } from '../../utils';
import NotificationSystem from 'react-notification-system';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

const Rx = require('rxjs/Rx');
const Observable = Rx.Observable;
import { ActionsObservable } from 'redux-observable';

import {
  PUBLISH_USER_GIST
} from '../../../src/notebook/constants';

import {
  publishNotebookObservable,
  createGistCallback,
  handleGistAction,
  handleGistError,
  notifyUser,
  publishEpic
} from '../../../src/notebook/epics/github-publish';

describe('handleGistAction', () => {
  it('returns an observable from User Action', () => {
    const publishUserAction = { type: 'PUBLISH_USER_GIST' }
    const store = dummyStore();
    const handleGist = handleGistAction(publishUserAction, store);
    expect(handleGist.subscribe).to.not.be.null;
  });
  it('returns an observable from anonymous Action', () => {
    const publishAnonymousAction = { type: 'PUBLISH_ANONYMOUS_GIST' }
    const store = dummyStore();
    const handleGist = handleGistAction(publishAnonymousAction, store);
    expect(handleGist.subscribe).to.not.be.null;
  })
})

describe('publishNotebookObservable', () => {
    it('returns an observable', () => {
        const notificationSystem = NotificationSystem();
        const publishNotebookObs = publishNotebookObservable(new GitHub(),
          dummyCommutable, './test.ipynb', notificationSystem);
        expect(publishNotebookObs.subscribe).to.not.be.null;
    });

    it('renders a notification popup', (done) => {
      const notificationSystem = NotificationSystem();
      const publishNotebookObs = publishNotebookObservable(new GitHub(),
        dummyCommutable, './test.ipynb', notificationSystem);
      const addNotification = sinon.spy(notificationSystem, 'addNotification');
      publishNotebookObs.subscribe( () => {
        expect(addNotification).to.be.called;
        done();
      });
    });

    it('calls create gist', (done) => {
      const github = new GitHub();
      const notificationSystem = NotificationSystem();
      const publishNotebookObs = publishNotebookObservable(github,
        dummyCommutable, './test.ipynb', notificationSystem);
      const create = sinon.spy(github.gists, 'create');
      publishNotebookObs.subscribe( () => {
        expect(create).to.be.called;
        done();
      });
    });
    it('edits gist that is already made', (done) => {
      const github = new GitHub();
      const notebook = dummyCommutable.setIn(['metadata', 'gist_id'], 'ID123')
      const notificationSystem = NotificationSystem();
      const publishNotebookObs = publishNotebookObservable(github,
        notebook, './test.ipynb', notificationSystem);
      const edit = sinon.spy(github.gists, 'edit');
      publishNotebookObs.subscribe( () => {
        expect(edit).to.be.called;
        done();
      });
    });
});

describe('createGistCallback', () => {
  it('returns a function', () => {
    const github = new GitHub();
    const notificationSystem = NotificationSystem();
    const publishNotebookObs = publishNotebookObservable(github,
      dummyCommutable, './test.ipynb', notificationSystem);
    const callback = createGistCallback(true, publishNotebookObs,
      './test.ipynb', notificationSystem);
    expect((typeof(callback))).to.equal('function');
  });
});

describe('notifyUser', () => {
  it('notifies a user that gist has been uploaded', () => {
    const store = dummyStore();
    const notification = store.getState().app.notificationSystem.addNotification;
    const notificationSystem = store.getState().app.notificationSystem;
    const notifyUserCall = notifyUser('filename', 'gistID', notificationSystem)
    expect(notification).to.be.calledWithMatch({
      title: 'Gist uploaded',
      message: `filename is ready`,
      dismissible: true,
      position: 'tr',
      level: 'success',
    });
  })
})
