import { expect } from 'chai';

import { getEntries } from '../../src/notebook/performance';
import { updateCellSource, executeCell } from '../../src/notebook/actions';
import { liveStore, dispatchQueuePromise, waitForOutputs } from '../utils';

const ACCEPTABLE = {
  'executeCell:roundtrip': 15.0,
};

describe('performance', function() {
  this.timeout(5000);
  it('is within acceptable', () => {
    return liveStore((kernel, dispatch, store) => {
      const cellId = store.getState().notebook.getIn(['cellOrder', 0]);
      const source = 'print("hello world")';
      dispatch(updateCellSource(cellId, source));

      // TODO: Remove hack
      // HACK: Wait 100ms before executing a cell because kernel ready and idle
      // aren't enough.  There must be another signal that we need to listen to.
      return (new Promise(resolve => setTimeout(resolve, 100)))
        .then(() => dispatch(executeCell(kernel.channels, cellId, source)))
        .then(() => dispatchQueuePromise(dispatch))
        .then(() => waitForOutputs(store, cellId))
        .then(() => {

          // Validate measurements are within an acceptable range.
          getEntries()
            .filter(x => x.entryType === 'measure')
            .forEach(x => {
              expect(x.duration).to.be.below(ACCEPTABLE[x.name], x.name);
            });
        });
    });
  });
});
