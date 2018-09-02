/* @flow */
let pendingScripts = [];
let pendingCallbacks = [];
let needsProcess = false;

/*
 * Process math in a script node using MathJax.
 */
function process(
  MathJax: Object,
  script: HTMLScriptElement,
  callback: () => void
) {
  pendingScripts.push(script);
  pendingCallbacks.push(callback);
  if (!needsProcess) {
    needsProcess = true;
    setTimeout(() => doProcess(MathJax), 0);
  }
}

function doProcess(MathJax: Object) {
  MathJax.Hub.Queue(() => {
    const oldElementScripts = MathJax.Hub.elementScripts;
    MathJax.Hub.elementScripts = element => pendingScripts;

    try {
      return MathJax.Hub.Process(null, () => {
        // Trigger all of the pending callbacks before clearing them
        // out.
        pendingCallbacks.forEach(callback => {
          callback();
        });

        pendingScripts = [];
        pendingCallbacks = [];
        needsProcess = false;
      });
    } catch (e) {
      // IE8 requires `catch` in order to use `finally`
      throw e;
    } finally {
      MathJax.Hub.elementScripts = oldElementScripts;
    }
  });
}

export default process;
