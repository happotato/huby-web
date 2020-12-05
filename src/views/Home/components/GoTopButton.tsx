import * as React from "react";

export default function GoTopButton() {
  function onClick(_: React.MouseEvent<HTMLButtonElement>) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <button className="go-top-btn btn btn-primary" onClick={onClick}>
      <i className="fa fa-chevron-up" aria-hidden="true"></i>
    </button>
  );
}
