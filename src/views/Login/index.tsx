import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";

import {
  ApplicationState,
  loginAction,
  authAction,
} from "~/services/store";

import {
  createHomeUrl,
  createCreateAccountUrl,
} from "~/services/utils";

export default function Login() {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((store: ApplicationState) => store.user);
  const isLoadingUser = useSelector((store: ApplicationState) => store.isLoadingUser);
  const params = new URLSearchParams(location.search);

  React.useEffect(() => {
    dispatch(authAction());
  }, []);

  React.useEffect(() => {
    if (user) {
      history.replace(params.get("location") || createHomeUrl());
    }
  }, [user]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    dispatch(loginAction({
      username: data.get("username") as string,
      password: data.get("pwd") as string,
    }));
  }

  return (
    <div className="d-flex align-items-center justify-content-center"
      style={{
        width: "100vw",
        height: "100vh",
      }}>
      <div className="card text-center shadow-sm">
        <div className="card-body">
          <Link className="card-link text-center" to={createHomeUrl()}>
            <h5><b>{process.env.NAME}</b></h5>
          </Link>
          <form className="mt-3" onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="username"
                className="form-control"
                required
                autoComplete="username"
                placeholder={t("placeholder.username")}/>
            </div>
            <div className="form-group">
              <input
                type="password"
                name="pwd"
                className="form-control"
                required
                minLength={8}
                autoComplete="current-password"
                placeholder={t("placeholder.password")}/>
            </div>
            <div className="btn-toolbar d-flex justify-content-between">
              <input
                type="submit"
                className="btn btn-primary"
                value={t("label.login") as string}/>
              <Link
                className="btn btn-link"
                to={createCreateAccountUrl(params.get("location") ?? undefined)}>
                {t("label.createAccount")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
