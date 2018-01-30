// @flow

export const COMMANDS = {
  EXECUTE: "execute",
  EXECUTE_AND_STEP: "execute-and-step",
  DEFAULT: "default"
};

const xor = (...args) => {
  let found = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] && found) {
      return false;
    } else if (args[i]) {
      found = true;
    }
  }
  return found;
};

export const eventToCommand = (event: KeyboardEvent) => {
  const { key, ctrlKey, metaKey, shiftKey, altKey, repeat } = event;
  switch (key) {
    case "Enter":
      if (xor(metaKey, ctrlKey, shiftKey) && !altKey && !repeat) {
        // Notes:
        //   1. We don't allow the altKey to reduce complexity.
        //   2. We ignore repeated keystrokes.
        //   3. We require one-and-only-one accepted modifier key (xor).
        if (shiftKey) {
          return COMMANDS.EXECUTE_AND_STEP;
        } else {
          return COMMANDS.EXECUTE;
        }
      }
      return COMMANDS.DEFAULT;
    default:
      return COMMANDS.DEFAULT;
  }
};

type HandlerFn = (event: KeyboardEvent) => void;

const handleKeyDownEvent = (
  handlers: { [string]: HandlerFn },
  event: KeyboardEvent
): void => {
  const command = eventToCommand(event);
  if (handlers[command]) {
    handlers[command](event);
  }
};

export default handleKeyDownEvent;
