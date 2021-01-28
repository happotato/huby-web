import * as React from "react";

export interface DropdownButtonProps {
  className?: string;
  defaultOpen?: boolean;
  text: string;
  children: (close: () => void) => React.ReactNode;
}

export default function DropdownButton(props: DropdownButtonProps) {
  const [state, setState] = React.useState({
    open: props.defaultOpen == true,
  });

  const divRef = React.createRef<HTMLDivElement>();

  function onButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
    setState({ open: !state.open });
  }

  function onButtonBlur(e: React.FocusEvent<HTMLButtonElement>) {
    const target = divRef.current;
    const relatedTarget = e.relatedTarget as HTMLElement | undefined;

    if (!target) return;

    if (!relatedTarget) {
      close();
      return;
    }

    if (!target.contains(relatedTarget)) {
      close();
    }
  }

  function close() {
    setState({ open: false });
  }

  return (
    <span
      className={props.className}>
      <button
        type="button"
        className="btn btn-transparent btn-sm dropdown-toggle"
        onBlur={onButtonBlur}
        onClick={onButtonClick}>
        {props.text}
      </button>
      <div
        ref={divRef}
        className={`bg-white border rounded shadow-sm mt-1 p-abs z-1${state.open ? "" : " d-none"}`}>
        {props.children(close)}
      </div>
    </span>
  );
}
