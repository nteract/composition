import { expect } from 'chai';

import { updateCellSource, executeCell } from '../../../src/notebook/actions';
import {
  liveStore,
  dispatchQueuePromise,
  waitFor,
  waitForOutputs,
  retry
} from '../../utils';

function sanityTestWidget(name) {
  it(name, function() {
    this.timeout(2000);
    this.retries(10);
    return liveStore((kernel, dispatch, store, widgetManager) => {
      const cellId = store.getState().document.getIn(['notebook', 'cellOrder', 0]);
      const source = `
import ipywidgets
from IPython.display import display
display(ipywidgets.${name}())
print("executed")
`;
      dispatch(updateCellSource(cellId, source));
      return widgetManager.versionValidated.filter(Boolean).first().toPromise()
        .then(() => dispatchQueuePromise(dispatch))
        .then(() => dispatch(executeCell(kernel.channels, cellId, source, true, undefined)))
        .then(() => dispatchQueuePromise(dispatch))
        .then(() => waitForOutputs(store, cellId))
        .then(() => {
          const output = store.getState().document.getIn(['notebook', 'cellMap', cellId, 'outputs', 0]).toJS();
          if (output && output.evalue) {
            throw new Error(output.evalue);
          }
          expect(output.name).to.equal('stdout');
          expect(output.text).to.equal('executed\n');
          expect(output.output_type).to.equal('stream');
        })
        .then(() => waitFor(() => {
          // Wait for the widget to be rendered
          return store.getState().document.getIn(['widgets', 'widgetViews', cellId]).count() > 0;
        }));
    });
  });
}

describe('widgets', function() {
  it('version validated', function() {
    this.timeout(2000);
    this.retries(10);
    return liveStore((kernel, dispatch, store, widgetManager) => {
      return widgetManager.versionValidated.filter(Boolean).first().toPromise();
    });
  });

  [
    'HTML',
    // 'Text',
    // 'ColorPicker',
    // 'Textarea',
    // 'Button',
    // 'ToggleButton',
    // 'ToggleButtons',
    // 'RadioButtons',
    // 'Select',
    // 'SelectMultiple',
    // 'Dropdown',
    // 'Box',
    // 'Accordion',
    // 'Tab',
    // 'HBox',
    // 'VBox',
    // 'BoundedFloatText',
    // 'FloatText',
    // 'BoundedIntText',
    // 'IntText',
    // 'Checkbox',
    // 'Valid',
    // 'Latex',
    // 'Label',
    // 'IntProgress',
    // 'FloatProgress',
    // 'IntSlider',
    // 'FloatSlider',
    // 'IntRangeSlider',
    // 'FloatRangeSlider',
    // 'SelectionSlider',
  ].map(sanityTestWidget);
});
