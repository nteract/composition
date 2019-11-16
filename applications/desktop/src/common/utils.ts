import { of } from "rxjs";
import { catchError } from "rxjs/operators";

export const mapErrorTo = <T>(target: T, pred: (err: any) => boolean) =>
  catchError(err => {
    if (pred(err)) {
      return of(target);
    } else {
      throw err;
    }
  });
