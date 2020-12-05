import * as React from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { ApplicationState } from "~/services/store";

interface AuthorizeProps {
  children: JSX.Element;
}

export default function Authorize(props: AuthorizeProps) {
  const user = useSelector((state: ApplicationState) => state.user);
  const location = useLocation();

  if (!user) {
    return (
      <Redirect to={`/login?location=${location.pathname}`}/>
    );
  }

  return props.children;
}
