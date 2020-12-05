import * as React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ApplicationState } from "~/services/store";

interface WaitStateProps<T> {
  selector: (state: T) => boolean;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

export default function WaitState<T = ApplicationState>(props: WaitStateProps<T>) {
  const ok = useSelector(props.selector);

  if (ok) {
    return (
      <React.Fragment>
        {props.children}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {props.fallback}
    </React.Fragment>
  );
}
