import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import {
  ApplicationState,
  logoutAction,
} from "~/services/store";

import {
  createClassName,
  createUserUrl,
  createCreateHubUrl,
  createLoginUrl,
} from "~/services/utils";

export interface UserControllerProps {
  className?: string;
}

export default function UserController(props: UserControllerProps) {
  const userToken = useSelector((store: ApplicationState) => store.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();
  const user = userToken?.user;

  if (user) {
    return (
      <div className={createClassName("d-flex flex-row align-items-center", props.className)}>
        <Link className="btn btn-primary btn-sm mr-2" to={createCreateHubUrl()}>
          <b>{t("label.createHub")}</b>
        </Link>
        <button className="btn btn-transparent btn-sm mr-2">
          <i className="fa fa-bell" aria-hidden="true"></i>
        </button>
        <button className="btn btn-transparent btn-sm mr-2" onClick={() => dispatch(logoutAction())}>
          <i className="fa fa-sign-out" aria-hidden="true"></i>
        </button>
        <Link to={createUserUrl(user.username)}>
          <img
            className="rounded"
            width="31px"
            height="31px"
            src={user.imageUrl ?? "/assets/avatar.webp"} />
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex flex-row align-items-center">
      <Link
        className="btn btn-outline-primary btn-sm"
        to={createLoginUrl(history.location.pathname)}>
        <b>{t("label.login")}</b>
      </Link >
    </div>
  );
}
