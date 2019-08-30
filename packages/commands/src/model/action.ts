export interface Action {
  type: string;
  payload: any;
  error?: boolean;
}

export type ActionFactory<T> = (params: T) => Action;
export type ActionHandler = () => void;

export function deriveAction<T, U>(
  action: ActionFactory<T & U>,
  fixed: U,
): ActionFactory<T> {
  return (params: T) => action({...fixed, ...params});
}
