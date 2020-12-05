import * as React from "react";
import { Route, Switch, } from "react-router-dom";

import Async from "~/components/Async";
import Error from "~/components/Error";
import Spinner from "~/components/Spinner";
import Authorize from "~/components/Authorize";
import FavBar from "./components/FavBar";
import Header from "./components/Header";
import GoTopButton from "./components/GoTopButton";
import HomePage from "./pages/HomePage";
import HubPage from "./pages/HubPage";
import UserPage from "./pages/UserPage";
import CreateHubPage from "./pages/CreateHubPage";

import {
  HubQueryResult,
  User,
  getHubs,
  useApi,
} from "~/services/api";

export default function Home() {
  const api = useApi();

  return (
    <React.Fragment>
      <div id="header" className="sticky-top shadow-sm">
        <FavBar />
        <Header />
      </div>
      <Switch>
        <Route exact path="/h/">
          <HomePage className="container py-3" />
        </Route>
        <Route exact path="/h/createhub">
          <Authorize>
            <CreateHubPage className="container py-3" />
          </Authorize>
        </Route>
        <Route path="/h/hub/:name">
          {({ match }) => {
            const name = match?.params.name;

            document.title = `${process.env.NAME} - ${name}`;

            return (
              <Async key={name} promiseFn={() => api.getHub(name)}>
                {([data, err, isLoading]) => {
                  if (err) return <Error />;
                  if (isLoading) return <Spinner />;

                  return (
                    <HubPage
                      className="container py-3"
                      hub={data as HubQueryResult} />
                  );
                }}
              </Async>
            );
          }}
        </Route>
        <Route path="/h/user/:username">
          {({ match }) => {
            const username = match?.params.username;

            document.title = `${process.env.NAME} - ${username}`;

            return (
              <Async key={username} promiseFn={() => api.getUser(username)}>
                {([data, err, isLoading]) => {
                  if (err) return <Error />;
                  if (isLoading) return <Spinner />;

                  return (
                    <UserPage className="container py-3" user={data as User} />
                  );
                }}
              </Async>
            );
          }}
        </Route>
      </Switch>
      <GoTopButton />
    </React.Fragment>
  );
}
