import * as React from "react";

export type AsyncResult<T, E> = [T | undefined, E | undefined, boolean];
export type AsyncResultExtended<T, E> = [T | undefined, E | undefined, boolean, (value: T | undefined) => void];

interface AsyncProps<T, E> {
  promiseFn: () => Promise<T>;
  children: (state: AsyncResult<T, E>) => JSX.Element;
}

export function useAsync<T, E = unknown>(promise: () => Promise<T>, deps?: React.DependencyList) : AsyncResultExtended<T, E>  {
  const [state, setState] = React.useState<AsyncResult<T, E>>([undefined, undefined, true]);

  React.useEffect(() => {
    let canceled = false;

    promise()
      .then(res => {
        if (!canceled) {
          setState([res, undefined, false]);
        }
      })
      .catch(err => {
        if (!canceled) {
          setState([undefined, err, false]);
        }
      });

    return () => {
      canceled = true;
    };
  }, deps);

  function setResult(value: T | undefined) {
    setState([value, undefined, false]);
  }

  return [...state, setResult];
}

export default function Async<T, E = unknown>(props: AsyncProps<T, E>) {
  const [res, err, isLoading] = useAsync<T, E>(props.promiseFn, []);
  return props.children([res, err, isLoading]);
}
