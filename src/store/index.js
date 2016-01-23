import * as commutable from 'commutable';

import { actions, launchKernel } from '../actions';

export default function createStore(initialState) {

  const store = actions.scan(
    (state, action) => {
      switch (action.type) {
      case 'READ_JSON':
        const { data } = action;
        const fetchedNotebook = commutable.fromJS(data);

        // We now have a notebook document and can determine what language to
        // launch
        const kernelSpecName = fetchedNotebook.getIn(['metadata', 'kernelspec', 'name']);
        launchKernel(kernelSpecName);

        return Object.assign({}, state, {
          notebook: fetchedNotebook,
        });
      case 'UPDATE_CELL':
        const { notebook, index, cell } = action;
        const updatedNotebook = notebook.setIn(['cells', index, 'source'], cell);
        return Object.assign({}, state, {
          notebook: updatedNotebook,
        });
      case 'LAUNCH_KERNEL':
        // Note: We'll want to delete c.connFile when all done
        //       as well as
        //       spawn.kill() when closed
        //       In fact, if there state.channels and state.spawn existed
        //       then we should clean them up
        const { channels, connectionFile, spawn } = action;
        console.log(connectionFile);
        channels.iopub.subscribe(msg => {
          console.log('iopub', msg);
        }, console.error);
        channels.shell.subscribe(msg => {
          console.log('shell', msg);
        }, console.error);

        const message = {
          header: {
            msg_id: `execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8`,
            username: 'rgbkrk',
            session: '00000000-0000-0000-0000-000000000000',
            msg_type: 'execute_request',
            version: '5.0',
          },
          content: {
            code: 'print("woo")',
            silent: false,
            store_history: true,
            user_expressions: {},
            allow_stdin: false,
          },
        };
        channels.shell.onNext(message);

        // At this point we now have channels.shell and channels.iopub
        // Which are subjects that can be operated on
        return Object.assign({}, state, {
          channels,
          spawn,
          connectionFile,
        });
      }
    },
    initialState || {}
  );

  return store;
}
