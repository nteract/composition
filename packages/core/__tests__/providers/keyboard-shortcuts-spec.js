// @flow
import React from "react";
import handleKeyDownEvent, {
  COMMANDS
} from "../../src/providers/keyboard-shortcuts/handle-key-down-event";

describe("KeyboardShortcuts ", () => {
  describe("handleKeyDownEvent", () => {
    describe("interprets and handles EXECUTE commands", () => {
      describe("by acting on valid events", () => {
        const validEvents = [
          { key: "Enter", metaKey: true },
          { key: "Enter", ctrlKey: true }
        ];
        validEvents.forEach(event => {
          test(JSON.stringify(event), () => {
            const handlers = { [COMMANDS.EXECUTE]: jest.fn() };
            // $FlowFixMe Flow is upset because we're mocking an event...
            handleKeyDownEvent(handlers, event);
            expect(handlers[COMMANDS.EXECUTE]).toHaveBeenCalledWith(event);
          });
        });
      });
      describe("by defaulting on invalid events", () => {
        const validEvents = [
          { key: "Backspace", metaKey: true },
          { key: "Enter", metaKey: true, ctrlKey: true },
          { key: "Enter", metaKey: true, altKey: true },
          { key: "Enter", metaKey: true, repeat: true },
          { key: "Enter", metaKey: true, shiftKey: true },
          { key: "Enter", ctrlKey: true, metaKey: true },
          { key: "Enter", ctrlKey: true, altKey: true },
          { key: "Enter", ctrlKey: true, repeat: true },
          { key: "Enter", ctrlKey: true, shiftKey: true },
          { key: "Enter", shiftKey: true, metaKey: true },
          { key: "Enter", shiftKey: true, altKey: true },
          { key: "Enter", shiftKey: true, repeat: true },
          { key: "Enter", shiftKey: true, ctrlKey: true }
        ];
        validEvents.forEach(event => {
          test(JSON.stringify(event), () => {
            const handlers = {
              [COMMANDS.EXECUTE]: jest.fn(),
              [COMMANDS.DEFAULT]: jest.fn()
            };
            // $FlowFixMe Flow is upset because we're mocking an event...
            handleKeyDownEvent(handlers, event);
            expect(handlers[COMMANDS.EXECUTE]).not.toHaveBeenCalled();
            expect(handlers[COMMANDS.DEFAULT]).toHaveBeenCalledWith(event);
          });
        });
      });
    });
    describe("interprets and handles EXECUTE_AND_STEP commands", () => {
      describe("by acting on valid events", () => {
        const validEvents = [{ key: "Enter", shiftKey: true }];
        validEvents.forEach(event => {
          test(JSON.stringify(event), () => {
            const handlers = { [COMMANDS.EXECUTE_AND_STEP]: jest.fn() };
            // $FlowFixMe Flow is upset because we're mocking an event...
            handleKeyDownEvent(handlers, event);
            expect(handlers[COMMANDS.EXECUTE_AND_STEP]).toHaveBeenCalledWith(
              event
            );
          });
        });
      });
      describe("by defaulting on invalid events", () => {
        const validEvents = [
          { key: "Backspace", shiftKey: true },
          { key: "Enter", shiftKey: true, metaKey: true },
          { key: "Enter", shiftKey: true, altKey: true },
          { key: "Enter", shiftKey: true, repeat: true },
          { key: "Enter", shiftKey: true, ctrlKey: true }
        ];
        validEvents.forEach(event => {
          test(JSON.stringify(event), () => {
            const handlers = {
              [COMMANDS.EXECUTE_AND_STEP]: jest.fn(),
              [COMMANDS.DEFAULT]: jest.fn()
            };
            // $FlowFixMe Flow is upset because we're mocking an event...
            handleKeyDownEvent(handlers, event);
            expect(handlers[COMMANDS.EXECUTE_AND_STEP]).not.toHaveBeenCalled();
            expect(handlers[COMMANDS.DEFAULT]).toHaveBeenCalledWith(event);
          });
        });
      });
    });
    describe("interprets and handles SAVE commands", () => {
      describe("by acting on valid events", () => {
        const validEvents = [
          { key: "s", metaKey: true },
          { key: "s", ctrlKey: true }
        ];
        validEvents.forEach(event => {
          test(JSON.stringify(event), () => {
            const handlers = { [COMMANDS.SAVE]: jest.fn() };
            // $FlowFixMe Flow is upset because we're mocking an event...
            handleKeyDownEvent(handlers, event);
            expect(handlers[COMMANDS.SAVE]).toHaveBeenCalledWith(event);
          });
        });
      });
      describe("by defaulting on invalid events", () => {
        const validEvents = [
          { key: "Backspace", metaKey: true },
          { key: "s", metaKey: true, ctrlKey: true },
          { key: "s", metaKey: true, altKey: true },
          { key: "s", metaKey: true, repeat: true },
          { key: "s", metaKey: true, shiftKey: true },
          { key: "s", ctrlKey: true, metaKey: true },
          { key: "s", ctrlKey: true, altKey: true },
          { key: "s", ctrlKey: true, repeat: true },
          { key: "s", ctrlKey: true, shiftKey: true },
          { key: "s", shiftKey: true, metaKey: true },
          { key: "s", shiftKey: true, altKey: true },
          { key: "s", shiftKey: true, repeat: true },
          { key: "s", shiftKey: true, ctrlKey: true }
        ];
        validEvents.forEach(event => {
          test(JSON.stringify(event), () => {
            const handlers = {
              [COMMANDS.SAVE]: jest.fn(),
              [COMMANDS.DEFAULT]: jest.fn()
            };
            // $FlowFixMe Flow is upset because we're mocking an event...
            handleKeyDownEvent(handlers, event);
            expect(handlers[COMMANDS.SAVE]).not.toHaveBeenCalled();
            expect(handlers[COMMANDS.DEFAULT]).toHaveBeenCalledWith(event);
          });
        });
      });
    });
  });
});
