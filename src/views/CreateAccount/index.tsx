import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { Link } from "react-router-dom";

import {
  ApplicationState,
  authAction,
  createAccountAction
} from "~/services/store";

import {
  createLoginUrl
} from "~/services/utils";

export default function CreateAccount() {
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
      history.replace(params.get("location") || "/");
    }
  }, [user]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    dispatch(createAccountAction({
      username: data.get("username") as string,
      password: data.get("pwd") as string,
      email: data.get("email") as string,
      name: data.get("name") as string,
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
          <Link className="card-link text-center" to="/">
            <h5><b>{process.env.NAME}</b></h5>
          </Link>
          <form className="mt-3" onSubmit={onSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                className="form-control"
                required
                autoComplete="name"
                placeholder={t("placeholder.name")} />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="username"
                className="form-control"
                required
                autoComplete="username"
                placeholder={t("placeholder.username")} />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                className="form-control"
                required
                autoComplete="email"
                placeholder={t("placeholder.email")} />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="pwd"
                className="form-control"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder={t("placeholder.password")} />
            </div>
            <div className="btn-toolbar d-flex justify-content-between">
              <input
                type="submit"
                className="btn btn-primary"
                value={t("label.create") as string} />
              <Link
                className="btn btn-link"
                to={createLoginUrl(params.get("location") ?? undefined)}>
                {t("label.login")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
