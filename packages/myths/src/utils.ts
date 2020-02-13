import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

export const mapErrorTo = <T, O>(target: T, pred: (err: any) => boolean) =>
  catchError<O, Observable<O> | Observable<T>>(err => {
    if (pred(err)) {
      return of(target);
    } else {
      throw err;
    }
  });
