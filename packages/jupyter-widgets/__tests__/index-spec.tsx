import * as React from "react";
import { WidgetDisplay } from "@nteract/jupyter-widgets";
import { Subject } from "rxjs";
import * as renderer from "react-test-renderer";

describe('index', () => {
  describe('WidgetDisplay', () => {
    /**
     * Tests that the component can be constructed.
     */
    it('can be constructed', () => {
      expect(<WidgetDisplay
        data={{model_id: 'none'}}
        channels={new Subject()}/>).not.toBeNull();
    });

    /**
     * Tests that the component can be rendered.
     */
    it('matches snapshot', () => {
      const renderedComponent = renderer.create(
          <WidgetDisplay data={{model_id: 'none'}} channels={new Subject()}/>);
      expect(renderedComponent.toJSON()).toMatchSnapshot();
    });
  });
});