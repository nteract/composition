declare type redux$Action = { type: $Subtype<string> };
declare type redux$AnyAction = { type: $Subtype<string>, [string]: any };
declare type redux$Dispatch<A: redux$Action> = (action: A) => A;

declare module "redux-observable" {
  import type { Dispatch, Middleware, MiddlewareAPI, Store } from "redux";

  declare export class ActionsObservable<
    T: redux$Action
  > extends rxjs$Observable<T> {
    /**
     * Just like RxJS itself, we can't actually make this method always type-safe
     * because we would need non-final position spread params e.g. `static of<T>(...items: T, scheduler?: Scheduler): ActionsObservable<T>` which isn't possible in either JavaScript or TypeScript. So instead, we provide safe typing for up to 6 items, following by a scheduler.
     */
    static of<T>(
      item1: T,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static of<T>(
      item1: T,
      item2: T,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static of<T>(
      item1: T,
      item2: T,
      item3: T,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static of<T>(
      item1: T,
      item2: T,
      item3: T,
      item4: T,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static of<T>(
      item1: T,
      item2: T,
      item3: T,
      item4: T,
      item5: T,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static of<T>(
      item1: T,
      item2: T,
      item3: T,
      item4: T,
      item5: T,
      item6: T,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static of<T>(...array: Array<T | rxjs$SchedulerLike>): ActionsObservable<T>;

    static from<T>(
      ish: rxjs$ObservableInput<T>,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<T>;
    static from<T, R>(
      ish: Array<T>,
      scheduler?: rxjs$SchedulerLike
    ): ActionsObservable<R>;

    constructor(input$: rxjs$Observable<T>): this;
    lift<R: redux$Action>(operator: rxjs$Operator<T, R>): ActionsObservable<R>;
    lift<R>(operator: rxjs$Operator<T, R>): rxjs$Observable<R>;
    ofType<R: T>(...key: Array<$PropertyType<R, "type">>): ActionsObservable<R>;
  }

  declare export class StateObservable<S> extends rxjs$Observable<S> {
    source: rxjs$Observable<S>;
    constructor(stateSubject: rxjs$Subject<S>, initialState: S): this;
    value: S;
  }

  declare export interface Epic<S, A, D> {
    (
      action$: ActionsObservable<A>,
      state$: StateObservable<S>,
      dependencies: D
    ): rxjs$Observable<A>;
  }

  declare export interface EpicMiddleware<S, A, D = any> {
    (api: MiddlewareAPI<S, A>): (next: Dispatch<A>) => Dispatch<A>;
    run(rootEpic: Epic<S, A, D>): void;
  }

  declare interface Options<D> {
    dependencies?: D;
  }

  declare export function createEpicMiddleware<S, A, D>(
    options?: Options<D>
  ): EpicMiddleware<S, A, D>;

  declare export function combineEpics<S, A, D>(
    ...epics: Array<Epic<S, A, D>>
  ): Epic<S, A, D>;
  declare export function combineEpics<E>(...epics: E[]): E;
  declare export function combineEpics(...epics: any[]): any;

  declare export function ofType<T, R>(
    ...key: Array<$PropertyType<R, "type">>
  ): (source: rxjs$Observable<T>) => rxjs$Observable<R>;
}
