import * as React from "react";

export default function Spinner() {
  return (
    <div className="text-center m-2">
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
