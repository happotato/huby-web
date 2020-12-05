import * as React from "react";

interface PopupProps {
  children: React.ReactNode;
  onCloseRequest?: () => void;
  open?: boolean;
}

export default function Popup(props: PopupProps) {
  return (
    <div className="popup" data-open={props.open}>
      <div className="popup-bg" onClick={() => props.onCloseRequest?.()}/>
      <div className="popup-content">
        {props.children}
      </div>
    </div>
  );
}
