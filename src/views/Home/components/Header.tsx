import * as React from "react";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SearchBar from "./SearchBar";
import UserController from "./UserController";

import {
  User,
  Hub,
  getHubs,
  useApi,
} from "~/services/api";

import {
  createHomeUrl,
  createHubUrl,
  createUserUrl,
} from "~/services/utils";

interface SearchData {
  hubs: Hub[];
  users: User[];
}

export default function Header() {
  const [showSearchBar, setShowSearchBar] = React.useState(false);
  const { t } = useTranslation();
  const history = useHistory();
  const api = useApi();

  async function onSearchRequest(text: string) {
    if (text.length == 0) return undefined;

    const hubs = await api.getHubs({
      name: text,
    });

    const users = await api.getUsers({
      username: text,
    });

    return {
      hubs,
      users,
    };
  }

  function onSearchRender(text: string, data: SearchData | undefined) {
    if (!data) return undefined;
    if (text.length == 0) return undefined;

    const { hubs, users } = data;

    const hubsSection = (
      <React.Fragment>
        <div className="card-header bg-terciary sticky-top">
          <b>{t("label.hub_plural")}</b>
        </div>
        {hubs.length == 0 &&
          <div className="card-body text-center text-muted">
            {t("label.empty")}
          </div>
        }
        {hubs.length > 0 &&
          <ul className="list-group list-group-flush">
            {hubs.map((hub, i) => (
              <Link
                key={i}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                to={createHubUrl(hub.name)}>
                <b className="text-muted">{hub.name}</b>
                <div>
                  {hub.isNSFW &&
                    <span className="badge badge-danger ml-2">{t("label.explicit")}</span>
                  }
                  {api.user?.id == hub.ownerId &&
                    <span className="badge badge-dark ml-2">{t("label.owner")}</span>
                  }
                  <span className="badge badge-primary ml-2">
                    {t("count", { value: hub.subscribersCount })}
                  </span>
                </div>
              </Link>
            ))}
          </ul>
        }
      </React.Fragment>
    );

    const usersSection = (
      <React.Fragment>
        <div className="card-header bg-terciary sticky-top">
          <b>{t("label.user_plural")}</b>
        </div>
        {users.length == 0 &&
          <div className="card-body text-center text-muted">
            {t("label.empty")}
          </div>
        }
        {users.length > 0 &&
          <ul className="list-group list-group-flush">
            {users.map((user, i) => (
              <Link
                key={i}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                to={createUserUrl(user.username)}>
                <b className="text-muted">{user.name} </b>
                <small className="text-muted">{user.username}</small>
              </Link>
            ))}
          </ul>
        }
      </React.Fragment>
    );

    return (
      <div className="border-0">
        {hubsSection}
        <hr className="sticky-top m-0"/>
        {usersSection}
      </div>
    );
  }

  const searchbar = (
    <SearchBar
      className="w-100"
      onSubmit={text => history.push(createHubUrl(text))}
      onRequest={onSearchRequest}
      placeholder={t("placeholder.search")}>
      {onSearchRender}
    </SearchBar>
  );

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-light border-bottom">
      <div className="row no-gutters align-items-center justify-content-between w-100">
        <Link className="col-auto navbar-brand text-muted" to={createHomeUrl()}>
          <b>{process.env.NAME}</b>
        </Link>
        <div className="col col-md-6 d-none d-md-block">
          {searchbar}
        </div>
        <div className="col-auto d-none d-md-block ml-3">
          <UserController className="float-right"/>
        </div>
        {showSearchBar &&
          <div className="col d-md-none">
            {searchbar}
          </div>
        }
        <div className="col-auto d-flex d-md-none flex-row align-items-center justify-content-end ml-3">
          <button
            className={`btn btn-secondary btn-sm${showSearchBar ? " active" : ""}`}
            onClick={() => setShowSearchBar(!showSearchBar)}>
            <i className="text-muted fa fa-search" aria-hidden="true"></i>
          </button>
          {!showSearchBar &&
            <UserController className="ml-3" />
          }
        </div>
      </div>
    </nav>
  );
}
