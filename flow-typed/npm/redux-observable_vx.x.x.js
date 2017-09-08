import { Observable } from "rxjs";

declare module "redux-observable" {
  import type { MiddlewareAPI, DispatchAPI } from "redux";

  declare export type Epic<S, A, D> = (
    action$: ActionsObservable<A>,
    store: MiddlewareAPI<S, A>,
    dependencies: D
  ) => Observable<A>;

  declare export type EpicMiddlewareAdapter<A> = {
    input: (Observable<A>) => Observable<A>,
    output: (Observable<A>) => Observable<A>
  };
  declare export type EpicMiddlewareOptions<A, D> = {
    adapter?: EpicMiddlewareAdapter<A>,
    dependencies?: D
  };
  declare export type EpicMiddleware<S, A> = {
    (api: MiddlewareAPI<S, A>): (next: DispatchAPI<A>) => DispatchAPI<A>,
    replaceEpic<D>(epic: Epic<S, A, D>): void
  };

  declare export class ActionsObservable<
    A: { +type: $Subtype<string> }
  > extends Observable<A> {
    static of(...actions: Array<A>): ActionsObservable<A>,
    static from(
      actions: Iterable<A>,
      scheduler: rxjs$SchedulerClass
    ): ActionsObservable<A>,
    constructor(actionsSubject: Observable<A>): void,
    lift(operator: Function): ActionsObservable<A>,
    ofType(...keys: Array<$PropertyType<A, "type">>): ActionsObservable<A>
  }

  declare export function combineEpics<S, A, D>(
    ...epics: Array<Epic<S, A, D>>
  ): Epic<S, A, D>;

  declare export function createEpicMiddleware<S, A, D>(
    epic: Epic<S, A, D>,
    options?: EpicMiddlewareOptions<A, D>
  ): EpicMiddleware<S, A>;

  declare export var EPIC_END: "@@redux-observable/EPIC_END";
}
