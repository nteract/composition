# Epics

> Compose and cancel async actions to encapsulate side effects

Across all state-backed nteract apps (desktop, web, play) we use
[redux-observable](https://redux-observable.js.org/) to manage asynchronous action flow. The core primitives used with redux-observable all come from RxJS. The primary benefits by extension then are:

* Ability to handle multi-valued streams like websockets (as opposed to promises which are single valued)
* Cancellable events

All this comes with a tradeoff though as RxJS has a (steep) learning curve. That in turn limits the amount of maintainers available. However, with the overall adoption of RxJS into Angular the amount of learning materials around Rx is only increasing.

## Practices around epics

* Limit how much state is captured in Epics instead of what could be tracked in the Redux store
* If they do capture internal state, ensure they're restartable and could recompute their internal state again

### What belongs in an epic

RxJS makes it really easy to string together high-level asynchronous primitives.

We need to know that if we resubscribe to the epic that we can get back to a good state. If for some reason there was internal state within an epic (which is almost unavoidable), we need to know that we can re-create that internal state or at least something workable.

As an example, let's take a modified version of the `autoSaveEpic` example from the redux-observable docs:

```js
const autoSaveEpic = (action$, state$) =>
  action$.pipe(
    ofType(AUTO_SAVE_ENABLE),
    // The use of an exhaustMap here is basically a flipped switch to say
    // "we are in autosaving mode, don't re-enable it again until requested"
    exhaustMap(() =>
      state$.pipe(
        // Get our "document"
        pluck("doc"),
        distinctUntilChanged(),
        throttleTime(500, { leading: false, trailing: true }),
        map(doc => actions.save({ contentRef: doc.contentRef })),
        takeUntil(action$.pipe(ofType(AUTO_SAVE_DISABLE)))
      )
    )
  );
```

If for some reason this epic is started over again while auto save was already enabled, it won't be enabled again until it sees `AUTO_SAVE_ENABLE`. One way of keeping this explicit and auto-adapting is to set a `autoSaveEnabled` boolean in the state tree itself then rely on the stream of states.

```js
const autoSaveEpic = (action$, state$) =>
  state$.pipe(
    // Watch to see when autoSaveEnabled is toggled
    pluck("autoSaveEnabled"),
    distinctUntilChanged(),
    // When autosave is enabled or disabled, we kick off a new observable
    switchMap(enabled => {
      if (!enabled) {
        return empty();
      }
      return state$.pipe(
        // Get our "document" -- note the
        pluck("content"),
        distinctUntilChanged((old, next) => old.model === next.model),
        throttleTime(500, { leading: false, trailing: true }),
        map(content => actions.save({ contentRef: content.contentRef })),
        // It's still ok to end this observable when disabled, even though it should get
        // handled by the switchMap above
        takeUntil(action$.pipe(ofType(AUTO_SAVE_DISABLE)))
      );
    })
  );
```

The important distinction here is that we watch the state of auto save being enabled or disabled from our root store.
