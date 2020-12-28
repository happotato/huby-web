import * as React from "react";

interface PopupProps {
  children: React.ReactNode;
  onCloseRequest?: () => void;
  open?: boolean;
  title?: string;
}

export default function Popup(props: PopupProps) {
  return (
    <div className="popup" data-open={props.open}>
      <div className="popup-bg" onClick={() => props.onCloseRequest?.()}/>
      <div className="popup-container">
        <div className="popup-content">
          <div className="card-header d-flex flex-row justify-content-between align-items-center">
            <b>{props.title}</b>
            <button className="btn btn-secondary btn-sm" onClick={() => props.onCloseRequest?.()}>
              <i className="text-muted fa fa-close" aria-hidden="true"></i>
            </button>
          </div>
          {props.children}
        </div>
      </div>
    </div>
  );
}
